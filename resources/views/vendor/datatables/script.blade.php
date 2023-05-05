// @TODO: this script is a turbolinks hacky workaround
// We need a way to delay this code execution until turbolinks
// merge head scripts (datatables.js), load and executes it first, can we?!
// By default 'turbolinks:load' here is loaded before it's deferred dependencies being loaded!
window.addEventListener('turbolinks:load', function() {
    @if ($routePrefix)window.Cortex.routePrefix = "{{ $routePrefix }}";@endif
    @if ($routeParams)window.Cortex.routeParams = {!! json_encode($routeParams) !!};@endif
    let LaravelDataTablesScripts = function(window,$) {window.LaravelDataTables = window.LaravelDataTables||{};window.LaravelDataTables["{{ $id }}"] = $("#{{ str_replace('.', '\\\.', $id) }}").DataTable({!! $options !!});}
    document.addEventListener('datatables.ready', function (e) {LaravelDataTablesScripts(window,$);}, false); // Fired only once when turbolinks enabled (the very beginning visit or hard refresh)
    if (window.DataTableReady){LaravelDataTablesScripts(window,$);} // Assigned after the first load of the page or hard refresh

    @if ($pusher)
        // Realtime updates
        window.Echo.private("{{ $pusher['channel'] }}")
          .listen('.{{ $pusher['entity'] }}.created', (e) => {
              window.LaravelDataTables["{{ $id }}"].draw();
          })
          .listen('.{{ $pusher['entity'] }}.updated', (e) => {
              window.LaravelDataTables["{{ $id }}"].draw();
          })
          .listen('.{{ $pusher['entity'] }}.deleted', (e) => {
              window.LaravelDataTables["{{ $id }}"].draw();
          })
          .listen('.{{ $pusher['entity'] }}.restored', (e) => {
              window.LaravelDataTables["{{ $id }}"].draw();
          });
    @endif
});
