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

            $data = array(
                'cartflows_swatches_active' => self::is_cartflows_swatches_active(),
            );

            wp_localize_script( $handle, 'wcDependableVariationsData', $data );

            wp_enqueue_script( $handle );
        }

        /**
         * Try to detect if Variation Swatches for WooCommerce by CartFlows is active.
         *
         * This intentionally checks multiple plugin signatures to remain resilient to
         * different install paths or editions.
         *
         * @return bool
         */
        private static function is_cartflows_swatches_active() {
            $signatures = array(
                'CFVSW_VERSION',
                'CFVSW_PLUGIN_FILE',
            );

            foreach ( $signatures as $signature ) {
                if ( defined( $signature ) ) {
                    return true;
                }
            }

            $classes = array(
                'CFVSW',
                'CFVSW_Public',
                'Cartflows_Variation_Swatches',
            );

            foreach ( $classes as $class ) {
                if ( class_exists( $class ) ) {
                    return true;
                }
            }

            if ( ! function_exists( 'is_plugin_active' ) ) {
                include_once ABSPATH . 'wp-admin/includes/plugin.php';
            }

            if ( function_exists( 'is_plugin_active' ) ) {
                $plugins = array(
                    'woo-variation-swatches/woo-variation-swatches.php',
                    'variation-swatches-woo/variation-swatches-woo.php',
                );

                foreach ( $plugins as $plugin ) {
                    if ( is_plugin_active( $plugin ) ) {
                        return true;
                    }
                }
            }

            return false;
        }
    }

    WC_Dependable_Variations::init();
}
