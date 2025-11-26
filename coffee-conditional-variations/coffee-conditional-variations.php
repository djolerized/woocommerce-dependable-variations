<?php
/**
 * Plugin Name: Coffee Conditional Variations
 * Description: Adds conditional logic between preparation and grind size attributes for variable coffee products.
 * Version: 1.0.0
 * Author: OpenAI
 * Text Domain: coffee-conditional-variations
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

final class CCV_Coffee_Conditional_Variations {
    const VERSION                     = '1.0.0';
    const ATTR_PREPARATION_SLUG       = 'pa_preparation';
    const ATTR_GRIND_SIZE_SLUG        = 'pa_grind_size';
    const PREPARATION_GROUND_TERM     = 'ground';
    const JS_HANDLE                   = 'ccv-conditional-variations';
    const CSS_HANDLE                  = 'ccv-conditional-variations';
    const TEXT_DOMAIN                 = 'coffee-conditional-variations';

    public static function init() {
        add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue_assets' ] );
        add_filter( 'woocommerce_add_to_cart_validation', [ __CLASS__, 'validate_add_to_cart' ], 10, 5 );
    }

    public static function enqueue_assets() {
        if ( ! function_exists( 'is_product' ) || ! is_product() ) {
            return;
        }

        global $product;

        if ( ! self::should_affect_product( $product ) ) {
            return;
        }

        wp_register_style(
            self::CSS_HANDLE,
            plugins_url( 'assets/css/conditional-variations.css', __FILE__ ),
            [],
            self::VERSION
        );

        wp_register_script(
            self::JS_HANDLE,
            plugins_url( 'assets/js/conditional-variations.js', __FILE__ ),
            [ 'jquery', 'wc-add-to-cart-variation' ],
            self::VERSION,
            true
        );

        wp_localize_script(
            self::JS_HANDLE,
            'ccvConfig',
            [
                'preparationName' => self::build_attribute_field_name( self::ATTR_PREPARATION_SLUG ),
                'grindName'       => self::build_attribute_field_name( self::ATTR_GRIND_SIZE_SLUG ),
                'groundValue'     => self::PREPARATION_GROUND_TERM,
                'errorMessage'    => __( 'Please select a grind size before adding this coffee to your cart.', self::TEXT_DOMAIN ),
            ]
        );

        wp_enqueue_style( self::CSS_HANDLE );
        wp_enqueue_script( self::JS_HANDLE );
    }

    /**
     * Validate add to cart to ensure grind size is provided when preparation is ground.
     */
    public static function validate_add_to_cart( $passed, $product_id, $quantity, $variation_id = 0, $variations = [] ) {
        $product = wc_get_product( $product_id );

        if ( ! self::should_affect_product( $product ) ) {
            return $passed;
        }

        $preparation_key = self::build_attribute_field_name( self::ATTR_PREPARATION_SLUG );
        $grind_key       = self::build_attribute_field_name( self::ATTR_GRIND_SIZE_SLUG );

        $preparation = self::get_chosen_value( $variations, $preparation_key );
        $grind_size  = self::get_chosen_value( $variations, $grind_key );

        if ( self::PREPARATION_GROUND_TERM !== $preparation ) {
            return $passed;
        }

        if ( '' === $grind_size ) {
            wc_add_notice( __( 'Please select a grind size before adding this coffee to your cart.', self::TEXT_DOMAIN ), 'error' );
            return false;
        }

        $valid_terms = self::get_product_attribute_terms( $product, self::ATTR_GRIND_SIZE_SLUG );

        if ( ! empty( $valid_terms ) && ! in_array( $grind_size, $valid_terms, true ) ) {
            wc_add_notice( __( 'Please select a valid grind size option for this coffee.', self::TEXT_DOMAIN ), 'error' );
            return false;
        }

        if ( $variation_id ) {
            $variation = wc_get_product( $variation_id );

            if ( $variation instanceof WC_Product_Variation ) {
                $attributes = $variation->get_attributes();

                if ( isset( $attributes[ self::ATTR_PREPARATION_SLUG ], $attributes[ self::ATTR_GRIND_SIZE_SLUG ] ) ) {
                    $variation_prep  = $attributes[ self::ATTR_PREPARATION_SLUG ];
                    $variation_grind = $attributes[ self::ATTR_GRIND_SIZE_SLUG ];

                    if ( self::PREPARATION_GROUND_TERM === $variation_prep && $variation_grind !== $grind_size ) {
                        wc_add_notice( __( 'Please select a matching grind size for the chosen preparation.', self::TEXT_DOMAIN ), 'error' );
                        return false;
                    }
                }
            }
        }

        return $passed;
    }

    private static function should_affect_product( $product ) {
        if ( ! $product instanceof WC_Product_Variable ) {
            return false;
        }

        $attributes = $product->get_attributes();

        return isset( $attributes[ self::ATTR_PREPARATION_SLUG ], $attributes[ self::ATTR_GRIND_SIZE_SLUG ] )
            && $attributes[ self::ATTR_PREPARATION_SLUG ]->get_variation()
            && $attributes[ self::ATTR_GRIND_SIZE_SLUG ]->get_variation();
    }

    private static function get_product_attribute_terms( $product, $attribute_key ) {
        $attributes = $product->get_variation_attributes();

        if ( isset( $attributes[ $attribute_key ] ) && is_array( $attributes[ $attribute_key ] ) ) {
            return array_map( 'wc_sanitize_taxonomy_name', array_filter( $attributes[ $attribute_key ] ) );
        }

        return [];
    }

    private static function build_attribute_field_name( $slug ) {
        return 'attribute_' . $slug;
    }

    private static function get_chosen_value( $variations, $key ) {
        if ( isset( $variations[ $key ] ) ) {
            return wc_sanitize_taxonomy_name( $variations[ $key ] );
        }

        if ( isset( $_REQUEST[ $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            return wc_sanitize_taxonomy_name( wp_unslash( $_REQUEST[ $key ] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
        }

        return '';
    }
}

CCV_Coffee_Conditional_Variations::init();
