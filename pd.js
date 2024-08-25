$(document).ready(function() {
    let table;

    function deslugify(text) {
        return text ? text
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase()) : null;
    }

    function getUrlEnding(url) {
        if (!url) return null;
        const segments = url.replace(/\/$/, '').split('/');
        return segments.pop() || null;
    }

    async function fetchData() {
        $('#loading').show();
        try {
            const response = await fetch('pdemon_data.json');
            const jsonData = await response.json();
            const rows = jsonData.rows || [];
            if (rows.length > 0) {
                const headers = Object.keys(rows[0]);
                const columns = headers.map((header, index) => {
                    let render = null;
                    switch(header) {
                        case 'image':
                            render = function(data, type, row) {
                                if (data) {
                                    return `
                                        <a href="${data}" target="_blank">
                                            <img src="${data}" alt="import" loading="lazy" style="max-width: 100px; max-height: 100px;"/>
                                        </a>`;
                                } else {
                                    return '';
                                }                                
                            };
                            break;
                        case 'species':
                        case 'breed':
                        case 'body_type':
                        case 'sex':
                        case 'tail':
                        case 'biorhythm':
                        case 'breath':
                        case 'status':
                            render = function(data, type, row) {
                                return deslugify(data);
                            };
                            break;
                        case 'abilities':
                        case 'mutations':
                        case 'health':
                            render = function(data, type, row) {
                                let items = data ? data.split(',') : [];
                                let str = items.map(item => `<span class="trait-pill">${deslugify(item)}</span>`).join('');
                                return str;
                            }
                            break;
                        case 'owner':
                            render = function(data, type, row) {
                                if (data) {
                                    return `<a href="https://www.paperdemon.com/app/u/${data}" target="_blank">${data}</a>`;
                                } else {
                                    return '';
                                }
                            }
                            break;
                        case 'designer':
                            render = function(data, type, row) {
                                if (data) {
                                    let user = getUrlEnding(data);
                                    return `<a href="${data}" target="_blank">${user}</a>`;
                                } else {
                                    return '';
                                }
                            }
                            break;

                    }
                    if (render) {
                        return {
                            title: deslugify(header),
                            data: header,
                            render: render
                        }
                    } else {
                        return {
                            title: deslugify(header),
                            data: header
                        }
                    }
                });

                $('#dataTable').DataTable({
                    data: rows,
                    columns: columns,
                    paging: true,
                    searching: true,
                    ordering: true,
                    scrollX: true,
                    scrollY: true,
                    order: [[1, 'asc']],
                    columnDefs: [
                        {
                            targets: [0],
                            orderable: false
                        }
                    ],
                    info: true,
                    // Additional DataTables options can be added here
                });

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