


export function apiGetRequest(endpoint){
    return $.ajax({
        // Our sample url to make request
        url: endpoint,

        // Type of Request
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
        },
        method: 'GET',
        // Function to call when to
        // request is ok
        success: function (data) {
           return data
        },

        // Error handling
        error: function (error) {
            $('#myModal').modal('hide')
            return null
        }
    });
}

export function apiPostRequest(endpoint,data){
    return $.ajax({
            // Our sample url to make request
            url:endpoint,

            // Type of Request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            method: 'POST',
            dataType: 'json',
            data : data,

            // Function to call when to
            // request is ok
            success: function (data) {
                return data
            },

            // Error handling
            error: function (error) {
                console.log(`Error ${error}`);
                return error;
            }
        });
}