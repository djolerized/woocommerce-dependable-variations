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

            const toggleRow = ($select, visible) => {
                const $row = $select.closest('tr');
                const $wrapper = $row.length ? $row : $select.closest('.form-row');

                $wrapper[visible ? 'show' : 'hide']();
                $select.prop('disabled', !visible);
            };

            const resetSelect = ($select, value = undefined) => {
                const fallback = $select.find('option').first().val();
                $select.val(value ?? fallback);
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

                $selects.each(function (index) {
                    const $select = $(this);
                    const attributeName = attributeNames[index];
                    const priorCriteria = getPriorCriteria(criteria, index);
                    const matchedVariations = matchVariations(priorCriteria);
                    const candidates = uniqueValues(matchedVariations, attributeName);
                    const visible = shouldShowAttribute(index, criteria);

                    if (!visible) {
                        const autoValue = candidates.length === 1 ? candidates[0] : '';
                        resetSelect($select, autoValue);
                        criteria[attributeName] = autoValue;
                    } else {
                        criteria[attributeName] = $select.val();
                    }

                    toggleRow($select, visible);
                });

                $form.trigger('woocommerce_variation_select_change');
                $form.trigger('check_variations');
            };

            $selects.on('change.wc-dependable-variations', function () {
                const index = $selects.index(this);

                $selects.slice(index + 1).each(function () {
                    resetSelect($(this));
                });

                updateVisibility();
            });

            updateVisibility();
        });
    });
})(jQuery);
