const ColumnType = Object.freeze({
    DEFAULT: 'default',
    PROPER_TEXT: 'proper_text',
    IMAGE: 'image',
    PILLS: 'pills',
    LINK: 'link',
    LINKS: 'links',
    DA_USER: 'deviantart_user',
    DA_USERS: 'deviantart_users',
    PD_USER: 'paperdemon_user',
    PD_USERS: 'paperdemon_users'
});

const Operator = Object.freeze({
    EQ: 'equals',
    NOT: 'not equals',
});

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

async function fetchData(id, url, headerRules = [], filterColumns = {}, unsortableColumns = [], originalOrderColumn = null, details = null, paging = true, info = true, searching = true) {
    $('#loading').show();
    try {
        const response = await fetch(url);
        const jsonData = await response.json();
        let rows = jsonData.rows || [];

        if (Object.keys(filterColumns).length > 0) {
            rows = rows.filter(row => {
                return Object.entries(filterColumns).every(([col, { value, operator }]) => {
                    const cellValue = row[col];
                    if (cellValue != null) {
                        const cellValueStr = cellValue.toString().toLowerCase();
                        const filterValueStr = value.toString().toLowerCase();
                        switch (operator) {
                            case Operator.EQ:
                                return cellValueStr.includes(filterValueStr);
                            case Operator.NOT:
                                return cellValueStr !== filterValueStr;
                        }
                    }
                    return false;
                });
            });
        }

        if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            const columns = headers.filter(header => headerRules[header]).map((header, index) => {
                const columnType = headerRules[header] || null;
                let render = null;

                switch(columnType) {
                    case ColumnType.IMAGE:
                        render = function(data) {
                            return `
                                <a href="${data}" target="_blank">
                                    <img src="${data}" alt="import" loading="lazy" style="max-width: 100px; max-height: 100px;"/>
                                </a>`;
                        };
                        break;
                    case ColumnType.PROPER_TEXT:
                        render = function(data) {
                            return deslugify(data);
                        };
                        break;
                    case ColumnType.PILLS:
                        render = function(data) {
                            let items = data ? data.split(',') : [];
                            let str = items.map(item => `<span class="trait-pill">${deslugify(item)}</span>`).join('');
                            return str;
                        }
                        break;
                    case ColumnType.LINK:
                        render = function(data) {
                            if (data) {
                                let user = getUrlEnding(data);
                                return `<a href="${data}" target="_blank">${user}</a>`;
                            } else {
                                return '';
                            }
                        }
                        break;
                    case ColumnType.LINKS:
                        render = function(data) {
                            let items = data ? data.split(/[,/]/) : [];
                            let str = items.map(item => `<a href="${item}" target="_blank">${getUrlEnding(item)}</a>`).join(', ');
                            return str;
                        }
                        break;
                    case ColumnType.DA_USERS:
                        render = function(data) {
                            let items = data ? data.split(/[,/]/) : [];
                            let str = items.map(item => `<a href="https://deviantart.com/${item}" target="_blank">${item}</a>`).join(', ');
                            return str;
                        }
                        break;
                    case ColumnType.DA_USER:
                        render = function(data) {
                            if (data) {
                                return `<a href="https://www.deviantart.com/${data}" target="_blank">${data}</a>`;
                            } else {
                                return '';
                            }
                        }
                        break;
                    case ColumnType.PD_USERS:
                        render = function(data) {
                            let items = data ? data.split(/[,/]/) : [];
                            let str = items.map(item => `<a href="https://paperdemon.com/app/u/${item}" target="_blank">${item}</a>`).join(', ');
                            return str;
                        }
                        break;
                    case ColumnType.PD_USER:
                        render = function(data) {
                            if (data) {
                                return `<a href="https://www.paperdemon.com/app/u/${data}" target="_blank">${data}</a>`;
                            } else {
                                return '';
                            }
                        }
                        break;
                    default:
                        render = function(data) {
                            return data;
                        };
                }
                if (render) {
                    return {
                        title: deslugify(header),
                        data: header,
                        render: render || undefined
                    }
                } else {
                    return {
                        title: deslugify(header),
                        data: header
                    }
                }
            });

            if (details) {
                columns.push({
                    title: details['title'],
                    data: details['column'],
                    render: function(data) {
                        return `<a href="${details['endpoint']}${data}">${details['text']}</a>`
                    }
                });
            }

            const columnDefs = unsortableColumns.map(column => ({
                targets: columns.findIndex(col => col.data === column),
                orderable: false
            }));

            const order = originalOrderColumn ?
                [[columns.findIndex(col => col.data === originalOrderColumn) || 0, 'asc']] :
                [[0, 'asc']];

            $(id).DataTable({
                data: rows,
                columns: columns,
                paging: paging,
                info: info,
                searching: searching,
                ordering: true,
                scrollX: true,
                scrollY: true,
                order: order,
                columnDefs: columnDefs,
                responsive: true,
                "sScrollXInner": "100%",
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}