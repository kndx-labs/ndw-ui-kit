import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parser, types as t} from 'storybook/internal/babel';

interface SourceFile {
  code: string;
  statements: t.Statement[];
}

const PARSER_PLUGINS: parser.ParserPlugin[] = ['typescript', 'decorators-legacy'];

const unwrapExport = (statement: t.Statement): t.Statement => {
  if ((t.isExportNamedDeclaration(statement) || t.isExportDefaultDeclaration(statement)) && t.isStatement(statement.declaration)) {
    return statement.declaration;
  }

  return statement;
};

export class TypeSources {
  public readonly files = new Set<string>();
  private readonly sources = new Map<string, SourceFile | null>();

  constructor(
    private readonly rootDir: string,
    private readonly declarationFiles: Map<string, string>,
  ) {}

  public has(name: string): boolean {
    return this.declarationFiles.has(name);
  }

  public declaration(name: string): string | null {
    const file = this.declarationFiles.get(name);

    if (!file) {
      return null;
    }

    const node = this.find(file, (statement) => {
      return (t.isTSInterfaceDeclaration(statement) || t.isTSTypeAliasDeclaration(statement)) && statement.id.name === name;
    });

    return node ? `export ${node}` : null;
  }

  public typeParameters(file: string, className: string): string | null {
    const source = this.source(file);
    const declaration = source?.statements
      .map(unwrapExport)
      .find((statement): statement is t.ClassDeclaration => t.isClassDeclaration(statement) && statement.id?.name === className);

    return source && declaration?.typeParameters ? this.text(source, declaration.typeParameters) : null;
  }

  private find(file: string, matches: (statement: t.Statement) => boolean): string | null {
    const source = this.source(file);
    const statement = source?.statements.map(unwrapExport).find(matches);

    return source && statement ? this.text(source, statement) : null;
  }

  private text(source: SourceFile, node: t.Node): string {
    return source.code.slice(node.start ?? 0, node.end ?? 0);
  }

  private source(file: string): SourceFile | null {
    const path = join(this.rootDir, file);

    if (!this.sources.has(path)) {
      this.sources.set(path, this.parse(path));
    }

    return this.sources.get(path) ?? null;
  }

  private parse(path: string): SourceFile | null {
    try {
      const code = readFileSync(path, 'utf8');

      this.files.add(path);

      return {code, statements: parser.parse(code, {sourceType: 'module', plugins: PARSER_PLUGINS}).program.body};
    } catch {
      return null;
    }
  }
}
