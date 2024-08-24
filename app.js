function appData() {
    return {
        data: [],
        headers: [],

        async fetchData() {
            try {
                const response = await fetch('https://dracostryx-public.s3.amazonaws.com/devart_data.json')
                const jsonData = await response.json();
                const rows = jsonData.rows || [];
                if (rows.length > 0) {
                    this.data = rows;
                    this.headers = Object.keys(rows[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }
}