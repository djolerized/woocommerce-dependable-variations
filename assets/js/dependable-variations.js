(function ($) {
  'use strict';

  function uniqueValues(values) {
    return Array.from(new Set(values.filter(function (value) {
      return value !== '' && value !== null && value !== undefined;
    })));
  }

  function getAttributeName($select) {
    return $select.attr('name');
  }

  function getClosestRow($select) {
    return $select.closest('tr').length ? $select.closest('tr') : $select.closest('.woocommerce-variation, .form-row, p');
  }

  function setFoundVariation($form, variation) {
    var $variationInput = $form.find('input.variation_id');

    if (!variation) {
      $variationInput.val('');
      $form.trigger('reset_data');
      return;
    }

    $variationInput.val(variation.variation_id);
    $form.trigger('found_variation', [variation]);
  }

  $(function () {
    $('.variations_form').each(function () {
      var $form = $(this);
      var variations = $form.data('product_variations');

      if (!variations || !variations.length) {
        return;
      }

      var $attributeSelectors = $form.find('select[name^="attribute_"]');

      if ($attributeSelectors.length < 2) {
        return;
      }

      var $primary = $($attributeSelectors[0]);
      var $dependents = $attributeSelectors.slice(1);
      var primaryName = getAttributeName($primary);

      function getMatchingVariations(primaryValue) {
        return variations.filter(function (variation) {
          var attributeValue = variation.attributes[primaryName];
          return attributeValue === primaryValue || (attributeValue === '' && primaryValue !== '');
        });
      }

      function toggleDependents(show) {
        $dependents.each(function () {
          var $select = $(this);
          var $row = getClosestRow($select);

          if (show) {
            $row.removeClass('wdv-hidden');
          } else {
            $select.val('');
            $row.addClass('wdv-hidden');
            $select.trigger('change');
          }
        });
      }

      function restrictOptions($select, allowedValues) {
        var currentValue = $select.val();
        var hasReset = false;

        $select.find('option').each(function () {
          var $option = $(this);
          var value = $option.val();

          if (value === '') {
            $option.prop('disabled', false);
            return;
          }

          var isAllowed = allowedValues.indexOf(value) !== -1;
          $option.prop('disabled', !isAllowed);

          if (!isAllowed && value === currentValue) {
            hasReset = true;
          }
        });

        if (hasReset) {
          $select.val('');
        }
      }

      function updateDependents(primaryValue) {
        if (!primaryValue) {
          setFoundVariation($form, null);
          toggleDependents(false);
          return;
        }

        var matchingVariations = getMatchingVariations(primaryValue);

        if (!matchingVariations.length) {
          setFoundVariation($form, null);
          toggleDependents(false);
          return;
        }

        var hasActiveDependents = false;

        $dependents.each(function () {
          var $select = $(this);
          var attributeName = getAttributeName($select);
          var allowedValues = uniqueValues(
            matchingVariations.map(function (variation) {
              return variation.attributes[attributeName];
            })
          );

          if (!allowedValues.length) {
            $select.val('');
            getClosestRow($select).addClass('wdv-hidden');
            $select.trigger('change');
            return;
          }

          getClosestRow($select).removeClass('wdv-hidden');
          restrictOptions($select, allowedValues);
          hasActiveDependents = true;
        });

        if (!hasActiveDependents) {
          var singleLevelVariations = matchingVariations.filter(function (variation) {
            return $dependents.toArray().every(function (select) {
              var attributeName = getAttributeName($(select));
              var value = variation.attributes[attributeName];
              return value === '' || value === null || value === undefined;
            });
          });

          if (singleLevelVariations.length === 1) {
            setFoundVariation($form, singleLevelVariations[0]);
            return;
          }
        }

        setFoundVariation($form, null);
      }

      $primary.on('change', function () {
        updateDependents($(this).val());
      });

      updateDependents($primary.val());
    });
  });
})(jQuery);
