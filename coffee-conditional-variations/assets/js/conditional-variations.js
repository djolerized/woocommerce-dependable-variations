(function ($) {
  'use strict';

  function findRow($select) {
    return $select.closest('tr').length
      ? $select.closest('tr')
      : $select.closest('.woocommerce-variation, .form-row, p');
  }

  $(function () {
    var config = window.ccvConfig || {};

    $('.variations_form').each(function () {
      var $form = $(this);
      var prepName = config.preparationName;
      var grindName = config.grindName;
      var groundValue = config.groundValue;

      if (!prepName || !grindName || !groundValue) {
        return;
      }

      var $prep = $form.find('select[name="' + prepName + '"]');
      var $grind = $form.find('select[name="' + grindName + '"]');

      if (!$prep.length || !$grind.length) {
        return;
      }

      var $grindRow = findRow($grind);
      var $addButton = $form.find('.single_add_to_cart_button');
      var $inlineError = $('<div class="wccv-inline-error" role="alert" aria-live="polite"></div>');

      if ($addButton.length) {
        $inlineError.insertBefore($addButton);
      }

      function clearError() {
        $inlineError.text('');
      }

      function setGrindVisible(show) {
        if (show) {
          $grind.prop('disabled', false);
          $grindRow.removeClass('wccv-hidden');
        } else {
          $grind.val('');
          $grind.prop('disabled', true);
          $grind.trigger('change');
          $grindRow.addClass('wccv-hidden');
          clearError();
        }
      }

      function requiresGrindSelection() {
        return $prep.val() === groundValue;
      }

      function validateGrindSelection() {
        clearError();

        if (!requiresGrindSelection()) {
          return true;
        }

        if (!$grind.val()) {
          var message = config.errorMessage || 'Please select a grind size before adding this coffee to your cart.';
          $inlineError.text(message);
          $grind.trigger('focus');
          return false;
        }

        return true;
      }

      $prep.on('change', function () {
        var isGround = $(this).val() === groundValue;
        setGrindVisible(isGround);
      });

      $form.on('submit', function (event) {
        if (!validateGrindSelection()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      setGrindVisible($prep.val() === groundValue);
    });
  });
})(jQuery);
