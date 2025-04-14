const checkRequiredFields = (fields, body) => {

    const missingFields = fields.filter(field=>!body[field]);

    return missingFields;
};

export default checkRequiredFields;