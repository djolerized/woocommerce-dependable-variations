# WooCommerce Dependable Variations

This plugin adds multilevel dependent variation handling to WooCommerce variable products. Attributes deeper in the variation chain stay hidden until their parent attributes are chosen. If a hidden attribute only has one valid choice, the plugin fills it automatically so shoppers can reach a valid variation quickly.

## Installation

1. Copy the `woocommerce-dependable-variations` folder into your site's `wp-content/plugins/` directory.
2. In the WordPress admin, go to **Plugins → Installed Plugins** and activate **WooCommerce Dependable Variations**.

## Usage

1. Create or edit a **variable product** in WooCommerce.
2. Add attributes in the order you want shoppers to pick them (e.g., `Level`, `Package`, `Feature`).
3. Create variations that reflect the valid combinations for those attributes.
4. Publish or update the product.

### How the selector behavior works

- On the product page, only the first attribute appears initially.
- After a shopper chooses a value, the next attribute appears *only* when there is more than one possible option for that level based on the prior selections.
- If a hidden attribute has exactly one valid option, the plugin auto-selects it in the background to keep the variation chain valid.
- Changing an upper-level choice resets any lower-level selections so customers always see valid combinations.

### Tips for predictable results

- The plugin uses the order of your variation attributes to determine the dependency chain. Arrange the attributes in the product edit screen from highest to lowest level.
- Every valid variation combination should be created in WooCommerce so the plugin can infer which child options are available.
- This works with any attribute names—no special naming is required.

## Compatibility and scope

- The script only loads on **variable product** pages and uses the standard WooCommerce variation form (`.variations_form`).
- No template overrides are required. The plugin relies on WooCommerce's built-in variation data to decide when to show or hide child attributes.
- Tested with **Variation Swatches for WooCommerce by CartFlows**.
  - When CartFlows swatches are active, only the first attribute is shown at first.
  - Choosing the *first* value (e.g., "Basic") auto-selects the first subvariation, hides the rest of the subvariation levels, and keeps swatches and selects in sync.
  - Choosing the *second* value (e.g., "Advanced") hides the first subvariation option, reveals the remaining subvariation swatches/options, and clears any previously auto-selected child values.

## Troubleshooting

- If you expect a child attribute to appear but it stays hidden, ensure more than one valid option exists for that level given the selected parents.
- If variations fail to load, confirm the product is a variable product and that WooCommerce is active.

## Uninstalling

Deactivate the plugin from **Plugins → Installed Plugins**. To remove it completely, delete the `woocommerce-dependable-variations` folder from `wp-content/plugins/`.
