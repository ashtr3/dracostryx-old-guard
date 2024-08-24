$(document).ready(function() {
    let table;

    async function fetchData() {
        $('#loading').show();
        try {
            const response = await fetch('devart_data.json');
            const jsonData = await response.json();
            const rows = jsonData.rows || [];
            if (rows.length > 0) {
                const headers = Object.keys(rows[0]);
                const columns = headers.map(header => ({
                    title: header,
                    data: header
                }));

                $('#dataTable').DataTable({
                    data: rows,
                    columns: columns,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    // Additional DataTables options can be added here
                });

                // Populate headers (optional, since DataTables handles this)
                $('#dataTable thead tr').html(columns.map(col => `<th>${col.title}</th>`).join(''));

                // Hide loading spinner and show table
                $('#loading').hide();
                $('#table-container').show();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    fetchData();
});