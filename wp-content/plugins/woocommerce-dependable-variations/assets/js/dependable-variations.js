(function ($) {
    'use strict';

    $(function () {
        const $forms = $('.variations_form');

        if (!$forms.length) {
            return;
        }

        $forms.each(function () {
            const $form = $(this);
            const variations = $form.data('product_variations') || [];
            const $selects = $form.find('.variations select');

            if (!variations.length || !$selects.length) {
                return;
            }

            const attributeNames = $selects
                .map(function () {
                    return $(this).data('attribute_name') || $(this).attr('name');
                })
                .get();

            const controls = attributeNames.map((attributeName, index) => {
                const $select = $selects.eq(index);
                const $swatches = $form.find(
                    `.cfvsw-swatches[data-attribute_name="${attributeName}"], .cfvsw-swatches[data-attribute-name="${attributeName}"]`
                );

                return {
                    attributeName,
                    $select,
                    $swatches,
                };
            });

            const matchVariations = (criteria) =>
                variations.filter((variation) =>
                    Object.entries(criteria).every(([key, value]) => {
                        const candidate = variation.attributes[key];

                        if (candidate === undefined || candidate === '') {
                            return true;
                        }

                        if (!value) {
                            return true;
                        }

                        return candidate === value;
                    })
                );

            const uniqueValues = (matchedVariations, attributeName) => {
                const values = new Set();

                matchedVariations.forEach((variation) => {
                    const optionValue = variation.attributes[attributeName];

                    if (optionValue) {
                        values.add(optionValue);
                    }
                });

                return Array.from(values);
            };

            const toggleControl = (control, visible) => {
                const { $select, $swatches } = control;
                const $row = $select.closest('tr');
                const $wrapper = $row.length ? $row : $select.closest('.form-row');

                $wrapper[visible ? 'show' : 'hide']();
                $select.prop('disabled', !visible);

                if ($swatches.length) {
                    $swatches[visible ? 'show' : 'hide']();
                    $swatches.find('input, button, select, option').prop('disabled', !visible);
                }
            };

            const setSelectValue = ($select, value = undefined, triggerChange = false) => {
                const fallback = $select.find('option').first().val();
                const nextValue = value ?? fallback;
                const previous = $select.val();

                $select.val(nextValue);

                if (triggerChange && previous !== nextValue) {
                    $select.trigger('change');
                } else if (triggerChange) {
                    $select.trigger('change');
                }
            };

            const getPriorCriteria = (criteria, index) =>
                Object.fromEntries(
                    Object.entries(criteria).slice(0, index)
                );

            const shouldShowAttribute = (index, criteria) => {
                if (index === 0) {
                    return true;
                }

                const priorCriteria = getPriorCriteria(criteria, index);
                const allPriorSelected = Object.values(priorCriteria).every(Boolean);

                if (!allPriorSelected) {
                    return false;
                }

                const matchedVariations = matchVariations(priorCriteria);
                const candidates = uniqueValues(matchedVariations, attributeNames[index]);

                return candidates.length > 1;
            };

            const updateVisibility = () => {
                const criteria = {};

                controls.forEach((control, index) => {
                    const { attributeName, $select } = control;
                    const priorCriteria = getPriorCriteria(criteria, index);
                    const matchedVariations = matchVariations(priorCriteria);
                    const candidates = uniqueValues(matchedVariations, attributeName);
                    const visible = shouldShowAttribute(index, criteria);

                    if (!visible) {
                        const autoValue = candidates.length === 1 ? candidates[0] : '';
                        setSelectValue($select, autoValue, true);
                        criteria[attributeName] = $select.val();
                    } else {
                        criteria[attributeName] = $select.val();
                    }

                    toggleControl(control, visible);
                });

                $form.trigger('woocommerce_variation_select_change');
                $form.trigger('check_variations');
            };

            $selects.on('change.wc-dependable-variations', function () {
                const index = $selects.index(this);

                $selects.slice(index + 1).each(function () {
                    setSelectValue($(this), undefined, true);
                });

                updateVisibility();
            });

            $form.on('click.wc-dependable-variations', '.cfvsw-swatches .cfvsw-swatches-option', function () {
                // Allow the swatch script to sync the hidden select first.
                setTimeout(updateVisibility, 0);
            });

            updateVisibility();
        });
    });
})(jQuery);
