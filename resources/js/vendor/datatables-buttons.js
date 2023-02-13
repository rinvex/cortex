(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($) {
            return factory($, window, document);
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (! root) {
                root = window;
            }

            if (! $ || ! $.fn.dataTable) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory($, root, root.document);
        };
    } else {
        // Browser
        factory(jQuery, window, document);
    }
}(function ($, window, document, undefined) {
    'use strict';
    let DataTable = $.fn.dataTable;

    let exportAction = function (e, dt, button, config, action) {
        let visibleColumns = getVisibleColumns();
        let dataTableBuilder = $('.dataTableBuilder');
        let selectedIds = dataTableBuilder.DataTable().column(0).checkboxes.selected();

        let $form = $('<form />');
        $form.attr('action', window.location + '?' + $.param(dt.ajax.params()));
        $form.attr('method', 'post');
        $form.append('<input type="hidden" name="action" value="' + action + '" />');
        $form.append('<input type="hidden" name="_token" value="' + window.Laravel.csrfToken + '" />');

        if (visibleColumns.length) {
            visibleColumns.join(',').split(',').forEach((visibleColumn) => $form.append('<input type="hidden" name="visible_columns[]" value="' + visibleColumn + '" />'));
        }

        if (selectedIds.length) {
            selectedIds.join(',').split(',').forEach((selectedId) => $form.append('<input type="hidden" name="selected_ids[]" value="' + selectedId + '" />'));
        }

        dataTableBuilder.append($form);
        $form.submit();
    };

    let getVisibleColumns = function () {
        let visible_columns = [];

        $.each(DataTable.settings[0].aoColumns, function (key, col) {
            if (col.bVisible) {
                visible_columns.push(col.name);
            }
        });

        return visible_columns;
    };

    // @TODO: add support for additional parameter. Example: change status to xyz
    let bulkAction = function (e, dt, button, config, action) {
        if (confirm('Are you sure you want to ' + action + ' all selected records?')) {
            let selectedIds = $('.dataTableBuilder').DataTable().column(0).checkboxes.selected();

            if (selectedIds.length > 0) {
                axios.post(window.location.href, {
                    action: action,
                    selected_ids: selectedIds.join(',').split(',')
                })
                     .then(function (response) {
                         let notification = function () {$.notify({message: response.data}, {type: 'success', mouse_over: 'pause', z_index: 9999, animate: {enter: 'animated fadeIn', exit: 'animated fadeOut'}});}; if (typeof notification === 'function') {notification(); notification = null;}
                         dt.search('').draw();
                         dt.column(0).checkboxes.deselectAll();
                     });
            } else {
                alert('No Selected Records!');
            }
        }
    };

    let customBulkAction = function (e, dt, button, config, options) {
        console.log(options);
        if (confirm('Are you sure you want to ' + options.title + ' all selected records?')) {
            let selectedIds = $('.dataTableBuilder').DataTable().column(0).checkboxes.selected();
            if (selectedIds.length > 0) {
                let url = window.location.href;
                if (options.url !== undefined) {
                    url = options.url;
                }
                axios.post(url, {
                    selected_ids: selectedIds.join(',').split(','),
                    action: options.name
                })
                     .then(function (response) {
                         let notification = function () {$.notify({message: response.data}, {type: 'success', mouse_over: 'pause', z_index: 9999, animate: {enter: 'animated fadeIn', exit: 'animated fadeOut'}});}; if (typeof notification === 'function') {notification(); notification = null;}
                         dt.search('').draw();
                         dt.column(0).checkboxes.deselectAll();
                     });
            } else {
                alert('No Selected Records!');
            }
        }
    };

    DataTable.ext.buttons.export = {
        extend: 'collection',
        className: 'buttons-export',
        buttons: ['csv', 'excel', 'pdf'],
        text: (dt) => '<i class="fa fa-download"></i> ' + dt.i18n('buttons.export', 'Export') + '&nbsp;<span class="caret"/>',
    };

    DataTable.ext.buttons.excel = {
        className: 'buttons-excel',
        action: (e, dt, button, config) => exportAction(e, dt, button, config, 'excel'),
        text: (dt) => '<i class="fa fa-file-excel-o"></i> ' + dt.i18n('buttons.excel', 'Excel'),
    };

    DataTable.ext.buttons.csv = {
        className: 'buttons-csv',
        action: (e, dt, button, config) => exportAction(e, dt, button, config, 'csv'),
        text: (dt) => '<i class="fa fa-file-excel-o"></i> ' + dt.i18n('buttons.csv', 'CSV'),
    };

    DataTable.ext.buttons.pdf = {
        className: 'buttons-pdf',
        action: (e, dt, button, config) => exportAction(e, dt, button, config, 'pdf'),
        text: (dt) => '<i class="fa fa-file-pdf-o"></i> ' + dt.i18n('buttons.pdf', 'PDF'),
    };

    DataTable.ext.buttons.print = {
        className: 'buttons-print',
        action: (e, dt, button, config) => exportAction(e, dt, button, config, 'print'),
        text: (dt) => '<i class="fa fa-print"></i> ' + dt.i18n('buttons.print', 'Print'),
    };

    DataTable.ext.buttons.reset = {
        className: 'buttons-reset',
        text: (dt) => '<i class="fa fa-undo"></i> ' + dt.i18n('buttons.reset', 'Reset'),
        action: (e, dt, button, config) => {
            dt.column(0).checkboxes.deselectAll();
            delete window.showSelected;
            dt.search('').draw();
        }
    };

    DataTable.ext.buttons.reload = {
        className: 'buttons-reload',
        text: (dt) => '<i class="fa fa-refresh"></i> ' + dt.i18n('buttons.reload', 'Reload'),
        action: (e, dt, button, config) => dt.draw(false),
    };

    DataTable.ext.buttons.create = {
        className: 'buttons-create',
        text: (dt) => '<i class="fa fa-plus"></i> ' + dt.i18n('buttons.create', 'Create'),
        action: (e, dt, button, config) => Turbolinks.visit(routes.route(window.Cortex.routePrefix + '.create')),
    };

    DataTable.ext.buttons.import = {
        className: 'buttons-import',
        text: (dt) => '<i class="fa fa-upload"></i> ' + dt.i18n('buttons.import', 'Import'),
        action: (e, dt, button, config) => Turbolinks.visit(routes.route(window.Cortex.routePrefix + '.import')),
    };

    DataTable.ext.buttons.showSelected = {
        className: 'buttons-selected',
        text: (dt) => '<i class="fa fa-check "></i> ' + dt.i18n('buttons.showSelected', 'Show Selected'),
        action: (e, dt, button, config) => {
            window.showSelected = true;
            dt.draw();
        },
    };

    // @TODO: allow dynamic bulk actions, possibly use wildcard or filter button by name starting with bulk
    DataTable.ext.buttons.bulk = {
        extend: 'collection',
        className: 'buttons-bulk',
        text: (dt) => '<i class="fa fa-list"></i> ' + dt.i18n('buttons.bulk', 'Bulk') + '&nbsp;<span class="caret"/>',
    };

    DataTable.ext.buttons.delete = {
        className: 'buttons-bulk-delete',
        action: (e, dt, button, config) => bulkAction(e, dt, button, config, 'delete'),
        text: (dt) => '<i class="fa fa-trash"></i> ' + dt.i18n('buttons.bulkDelete', 'Delete'),
    };

    DataTable.ext.buttons.activate = {
        className: 'buttons-bulk-activate',
        action: (e, dt, button, config) => bulkAction(e, dt, button, config, 'activate'),
        text: (dt) => '<i class="fa fa-trash"></i> ' + dt.i18n('buttons.bulkActivate', 'Activate'),
    };

    DataTable.ext.buttons.deactivate = {
        className: 'buttons-bulk-deactivate',
        action: (e, dt, button, config) => bulkAction(e, dt, button, config, 'deactivate'),
        text: (dt) => '<i class="fa fa-trash"></i> ' + dt.i18n('buttons.bulkDeactivate', 'Deactivate'),
    };

    DataTable.ext.buttons.revoke = {
        className: 'buttons-bulk-revoke',
        action: (e, dt, button, config) => bulkAction(e, dt, button, config, 'revoke'),
        text: (dt) => '<i class="fa fa-trash"></i> ' + dt.i18n('buttons.bulkRevoke', 'Revoke'),
    };

    DataTable.ext.buttons.create_popup = {
        className: 'buttons-create-popup',
        text: (dt) => '<i class="fa fa-plus"></i> ' + dt.i18n('buttons.create', 'Create'),
    };

    if (window.Cortex.customBulkActions !== undefined) {
        for (var i = 0; i < window.Cortex.customBulkActions.length ; i++) {
            const options = window.Cortex.customBulkActions[i];
            const name = options.name;
            let title = options.title;
            if (options.icon !== undefined) {
                title = `<i class="${options.icon}"></i> ${title}`;
            }

            DataTable.ext.buttons[name] = {
                className: 'buttons-bulk-'+name,
                action: (e, dt, button, config) => customBulkAction(e, dt, button, config, options),
                text: (dt) => title,
            };
        }
    }

}));
