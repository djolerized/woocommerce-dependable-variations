<?php
/**
 * Plugin Name: WooCommerce Dependable Variations
 * Description: Adds dependent, multi-level variation handling for variable products.
 * Version: 1.0.0
 * Author: OpenAI
 * License: GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

final class WDV_Dependable_Variations {
    const VERSION = '1.0.0';

    public static function init() {
        add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue_assets' ] );
    }

    public static function enqueue_assets() {
        if ( ! function_exists( 'is_product' ) || ! is_product() ) {
            return;
        }

        wp_register_style(
            'wdv-dependable-variations',
            plugins_url( 'assets/css/dependable-variations.css', __FILE__ ),
            [],
            self::VERSION
        );

        wp_register_script(
            'wdv-dependable-variations',
            plugins_url( 'assets/js/dependable-variations.js', __FILE__ ),
            [ 'jquery', 'wc-add-to-cart-variation' ],
            self::VERSION,
            true
        );

        wp_enqueue_style( 'wdv-dependable-variations' );
        wp_enqueue_script( 'wdv-dependable-variations' );
    }
}

WDV_Dependable_Variations::init();
