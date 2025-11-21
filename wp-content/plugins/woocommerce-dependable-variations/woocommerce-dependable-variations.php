<?php
/**
 * Plugin Name: WooCommerce Dependable Variations
 * Description: Adds multilevel, dependent variation selection for WooCommerce variable products.
 * Version: 1.0.0
 * Author: OpenAI ChatGPT
 * License: GPL-2.0+
 * Text Domain: wc-dependable-variations
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'WC_Dependable_Variations' ) ) {
    class WC_Dependable_Variations {
        /**
         * Hook plugin.
         */
        public static function init() {
            add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_scripts' ) );
        }

        /**
         * Enqueue frontend assets on variable product pages.
         */
        public static function enqueue_scripts() {
            if ( ! is_product() ) {
                return;
            }

            global $product;

            if ( ! $product instanceof WC_Product_Variable ) {
                return;
            }

            $handle = 'wc-dependable-variations';

            wp_register_script(
                $handle,
                plugins_url( 'assets/js/dependable-variations.js', __FILE__ ),
                array( 'jquery', 'wc-add-to-cart-variation' ),
                '1.0.0',
                true
            );

            wp_enqueue_script( $handle );
        }
    }

    WC_Dependable_Variations::init();
}
