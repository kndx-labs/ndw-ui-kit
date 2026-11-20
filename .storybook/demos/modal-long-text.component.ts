import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'sb-modal-long-text',
  template: `
    <h4>The Comprehensive Guide to Sustainable Living</h4>
    <p>
      Sustainable living is more than just a trend; it is a lifestyle choice aimed at reducing an individual's or
      society's use of the Earth's natural resources. By making small changes in our daily routines, we can
      collectively make a significant impact on the health of our planet.
    </p>

    <h4>1. Understanding Renewable Energy</h4>
    <p>
      Transitioning to renewable energy is one of the most effective ways to lower your carbon footprint. This
      involves moving away from fossil fuels like coal and gas toward sources that naturally replenish, such as solar,
      wind, and geothermal energy.
    </p>
    <p>
      For many homeowners, installing solar panels is the primary step. Not only does this reduce reliance on the
      grid, but it also ties into the financial benefits mentioned later in this guide. Even if you cannot install
      panels, many utility companies now offer "green pricing" programs that allow you to support renewable energy
      projects through your monthly bill.
    </p>

    <h4>2. Green Transportation Options</h4>
    <p>
      The way we move from place to place accounts for a massive portion of global greenhouse gas emissions.
      Sustainable transportation focuses on efficiency and the reduction of single-occupancy vehicle trips.
    </p>
    <p>Key strategies include:</p>
    <ul>
      <li><strong>Public Transit:</strong> Utilizing buses and trains.</li>
      <li><strong>Active Transport:</strong> Walking or cycling for short distances.</li>
      <li><strong>Electric Vehicles (EVs):</strong> Reducing tailpipe emissions.</li>
    </ul>
    <p>
      If you find that your commute is too long for walking, consider how dietary choices and local shopping can
      actually reduce the need for long-distance travel by supporting local supply chains.
    </p>

    <h4>3. Sustainable Dietary Choices</h4>
    <p>
      What we eat has a profound impact on the environment. The industrial food system is resource-intensive,
      requiring vast amounts of water and land. Transitioning to a plant-forward diet is often cited as the single
      most impactful change an individual can make.
    </p>
    <p>
      By choosing locally sourced, organic produce, you reduce the "food miles" associated with your meals. This
      mimics the philosophy of zero waste management, as local markets often use less plastic packaging than
      traditional supermarkets.
    </p>

    <h4>4. Zero Waste Management</h4>
    <p>
      The "Zero Waste" movement encourages the redesign of resource life cycles so that all products are reused. The
      goal is for no trash to be sent to landfills, incinerators, or the ocean.
    </p>
    <p>To begin this journey, follow the five R's:</p>
    <ol>
      <li><strong>Refuse</strong> what you do not need.</li>
      <li><strong>Reduce</strong> what you do use.</li>
      <li><strong>Reuse</strong> whatever you can.</li>
      <li><strong>Recycle</strong> what you cannot refuse, reduce, or reuse.</li>
      <li><strong>Rot</strong> (Compost) the rest.</li>
    </ol>
    <p>
      Mindful consumption in this area often leads to significant cost savings because you are no longer paying for
      disposable convenience items.
    </p>

    <h4>5. The Financial Benefits</h4>
    <p>
      A common misconception is that living sustainably is expensive. While some upfront costs (like solar panels or
      high-quality reusable goods) are higher, the long-term financial outlook is very positive.
    </p>
    <p>
      By following the principles in the energy section, you can drastically reduce or eliminate utility bills.
      Similarly, adopting a minimalist waste strategy means buying fewer items and choosing quality over quantity,
      which saves money over years of use. Sustainability is, at its core, an investment in a more efficient and
      affordable future.
    </p>

    <p><em>Thank you for reading this guide.</em></p>
  `,
  styles: `
    :host {
      display: block;
      color: var(--ndwu-color-gray-80);
      line-height: 1.6;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbModalLongTextComponent {}
