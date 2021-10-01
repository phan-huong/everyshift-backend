function isEmptyObject(obj) {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}

function get_local_user_data() {
    return JSON.parse(localStorage.getItem("userData"));
}

function get_local_user_token() {
    return localStorage.getItem("logged_in_token");
}

function update_local_user_data(data) {
    localStorage.setItem("userData", JSON.stringify(data));
}

function check_if_manager(userData) {
    return userData.role === 'manager' ? true : false;
}

function sort_by_date(arr) {
    arr.sort(function(a, b) {
        var c = new Date(a.date);
        var d = new Date(b.date);
        return c-d;
    });
    return arr;
}

function sort_by_date_from_db(arr) {
    arr.sort(function(a, b) {
        var c = new Date(a);
        var d = new Date(b);
        return c-d;
    });
    return arr;
}

/**
 * Convert a full name to super short name
 * E.g. Rose Smith => RS or José Mário dos Santos Félix Mourinho => JMdSFM
 * @param {String} firstname 
 * @param {String} lastname 
 * @returns {String}
 */
function get_short_name(firstname, lastname) {
    function shorten_name(name) {
        let sub_names = name.split(' ');
        let short_name = '';
        for (const sub_name of sub_names) {
            short_name += sub_name.substring(0, 1);
        }

        return short_name;
    }

    return shorten_name(firstname) + shorten_name(lastname);
}

export {
    isEmptyObject,
    get_local_user_token,
    get_local_user_data,
    update_local_user_data,
    check_if_manager,
    sort_by_date,
    sort_by_date_from_db,
    get_short_name
}