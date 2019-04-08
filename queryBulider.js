/**
 * This method using for build query for filter.
 * We have basic query named "query" and parameters from req.body
 * We need
 * @param params
 * @param EmployeeID
 * @returns {string}
 */
// Query view
// http://0.0.0.0:7000/kb/search/?w=sub&helpgte=90&helplte=40&key=sub&cat=1&label=1&type=1&access=1&product=1&collab=500;508&starred=true$archived=true

module.exports = (params, EmployeeID) => {

    console.log(params);
    let query = `SELECT DISTINCT a.id,
       a.title,
       a.purpose,
       a.updated_at,
       a.created_at,
       acc.accessibility,
       s.id                                      AS isStarred,
       (SELECT KB_calculateHeedfulByArtId(a.id)) AS helpfulRate
FROM kb_articles a
       LEFT OUTER JOIN kb_accessibilitys acc on a.accesability_id = acc.id
       LEFT OUTER JOIN kb_label_to_article l on a.id = l.article_id
       LEFT OUTER JOIN kb_employee_to_article e2a on a.id = e2a.article_id
       LEFT OUTER JOIN kb_starred_articles s on a.id = s.article_id AND s.employee_id = ${EmployeeID}`;

    if (Object.keys(params).length !== 0) {
        return addParams(params, query, EmployeeID)
    }
    return query;

};


function addParams(params, query, EmployeeID) {

    query += ' WHERE';

    if (params.w) {
        query += ` (a.text LIKE "%${params.w}%"
               OR a.purpose LIKE "%${params.w}%"
               OR a.title LIKE "%${params.w}%")
                AND`
    }

    if (params.key) {
        let keysArr = params.key.split(';');
        keysArr.map(key => {
            query += ` a.keywords LIKE "%${key}%" AND`
        })
    }

    if (params.cat) {
        query += ` a.categorie_id = ${params.cat} AND`
    }

    if (params.label) {
        query += ` (l.label_id = ${params.label} AND l.article_id = a.id) AND`
    }

    if (params.type) {
        query += ` a.type_id = ${params.type} AND`
    }

    if (params.access) {
        query += ` a.accesability_id = ${params.access} AND`
    }

    if (params.collab) {
        // e2a.employee_id IN (508, 500)
        query += ' e2a.employee_id IN (';

        let collArr = params.collab.split(';');
        collArr.map(collId => {
            query += `${collId}, `
        });
        query = query.slice(0, -2) + ') AND'
    }

    if (params.starred) {
        query += ` (s.employee_id = ${EmployeeID} AND s.article_id = a.id) AND`
    }

    if (params.archived) {
        query += `  a.is_archived = 1 AND`
    } else {
        query += `  a.is_archived = 0 AND`
    }

    if (query.slice(-4) === ' AND') {
        query = query.slice(0, -4);
    }
    if (query.slice(-6) === ' WHERE') {
        query = query.slice(0, -6);
    }

    query += `;`;
    console.log(query);
    return query
}
