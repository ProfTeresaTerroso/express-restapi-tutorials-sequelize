const db = require("../models/index.js");
const Tutorial = db.tutorial;

//necessary for LIKE operator
const { Op } = require('sequelize');

// calculates limit and offset parameters for Sequelize Model method findAndCountAll(), 
// from API request query parameters: page and size
const getPagination = (page, size) => {
    const limit = size ? size : 3; // limit = size (default is 3)
    const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

    return { limit, offset };
};

// function to map default response to desired response data structure
// {
//     "totalItems": 8,
//     "tutorials": [...],
//     "totalPages": 3,
//     "currentPage": 1
// }
const getPagingData = (data, page, limit) => {
    // data Sequelize Model method findAndCountAll function has the form
    // {
    //     count: 5,
    //     rows: [
    //              tutorial {...}
    //         ]
    // }
    const totalItems = data.count;
    const tutorials = data.rows;
    const currentPage = page;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, tutorials, totalPages, currentPage };
};

// Display list of all tutorials
exports.findAll = (req, res) => {
    //get data from request query string
    let { page, size, title } = req.query;
    const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

    // validate page
    if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Page number must be 0 or a positive integer' });
        return;
    }
    else
        page = parseInt(page); // if OK, convert it into an integer
    // validate size
    if (size && !req.query.size.match(/^([1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Size must be a positive integer' });
        return;
    } else
        size = parseInt(size); // if OK, convert it into an integer

    // convert page & size into limit & offset options for findAndCountAll
    const { limit, offset } = getPagination(page, size);

    Tutorial.findAndCountAll({ where: condition, limit, offset })
        .then(data => {
            // convert response data into custom format
            const response = getPagingData(data, offset, limit);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

// Handle tutorial create on POST
exports.create = (req, res) => {
    // Save Tutorial in the database
    Tutorial.create(req.body)
        .then(data => {
            res.status(201).json({ message: "New tutorial created.", location: "/tutorials/" + data.id });
        })
        .catch(err => {
            if (err.name === 'SequelizeValidationError')
                res.status(400).json({ message: err.errors[0].message });
            else
                res.status(500).json({
                    message: err.message || "Some error occurred while creating the Tutorial."
                });
        });
};

// List just one tutorial
exports.findOne = (req, res) => {
    // obtains only a single entry from the table, using the provided primary key
    Tutorial.findByPk(req.params.tutorialID)
        .then(data => {
            if (data === null)
                res.status(404).json({
                    message: `Not found Tutorial with id ${req.params.tutorialID}.`
                });
            else
                res.json(data);
        })
        .catch(err => {
            res.status(500).json({
                message: `Error retrieving Tutorial with id ${req.params.tutorialID}.`
            });
        });
};

exports.update = (req, res) => {
    // validate request body data
    if (!req.body || !req.body.title) {
        res.status(400).json({ message: "Request body can not be empty!" });
        return;
    }

    Tutorial.update(req.body, { where: { id: req.params.tutorialID } })
        .then(num => {
            if (num == 1) {
                res.json({
                    message: `Tutorial with id=${req.params.tutorialID} was updated successfully.`
                });
            } else {
                res.status(404).json({
                    message: `Not found Tutorial with id=${req.params.tutorialID}.`
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: `Error updating Tutorial with id=${req.params.id}.`
            });
        });
};

exports.delete = (req, res) => {

    Tutorial.destroy({ where: { id: req.params.tutorialID } })
        .then(num => {
            if (num == 1) {
                res.status(200).json({
                    message: `Tutorial with id ${req.params.tutorialID} was successfully deleted!`
                });
            } else {
                res.status(404).json({
                    message: `Not found Tutorial with id=${req.params.tutorialID}.`
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: `Error deleting Tutorial with id=${req.params.tutorialID}.`
            });
        });
};

// Display list of all published tutorials
exports.findAllPublished = (req, res) => {
    //get data from request query string
    const { page, size } = req.query;

    // validate page
    if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Page number must be 0 or a positive integer' });
        return;
    }
    else
        page = parseInt(page); // if OK, convert it into an integer
    // validate size
    if (size && !req.query.size.match(/^([1-9]\d*)$/g)) {
        res.status(400).json({ message: 'Size must be a positive integer' });
        return;
    } else
        size = parseInt(size); // if OK, convert it into an integer

    // convert page & size into limit & offset options for findAndCountAll
    const { limit, offset } = getPagination(page, size);

    Tutorial.findAndCountAll({ where: { published: true }, limit, offset })
        .then(data => {
            // convert response data into custom format
            const response = getPagingData(data, offset, limit);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};