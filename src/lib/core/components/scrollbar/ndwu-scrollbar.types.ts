// CSS lengths; unset sides keep the defaults from the SCSS. Use `0px`, not `0`: the values are
// summed in calc(), where a unitless 0 drops the declaration.
export interface NdwuScrollbarPadding {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
}
