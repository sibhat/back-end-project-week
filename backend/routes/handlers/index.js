const bcrypt = require('bcryptjs');
const db = require('../../data/knexConfig');
module.exports = {
    error: (error, req, res, next) => {
        res.status(error.status || 500).json(error.message || "request couldnt be found")
    },
    getUsers: (req, res, next) => {
        const qurey = db('users')
        if (req.params.id) {
            qurey.where({
                id: req.params.id
            }).first().then(result => {
                res.status(200).json(result)
            }).catch(error => next({
                message: error.message,
                status: 500
            }))
        } else {

            qurey.then(result => {
                res.status(200).json(result)
            }).catch(error => next({
                message: error.message,
                status: 500
            }))
        }
    },
    getUserNotes: (req, res, next) => {
        db('users').where({
            id: req.params.user_id
        }).first().then(result => {
            if (result) {
                db('notes').where({
                    user_id: result.id
                }).then(result => {
                    res.status(200).json(result)
                })
            } else {
                next({
                    message: "user donst have notes"
                })
            }
        })
    },
    register: (req, res, next) => {
        const newUser = req.body;
        if (newUser.name && newUser.username && newUser.password) {
            newUser.password = bcrypt.hashSync(newUser.password, 14);
            db('users').insert(newUser).then(result => {
                // console.log(result)
                res.status(200).json(result);
            }).catch(error => next({
                message: error.message,
                status: 401
            }))

        } else {
            next({
                message: 'username and password is required'
            })
        }
    },
    signIn: (req, res, next) => {
        const newUser = req.body;
        if (newUser.username && newUser.password) {
            db('users').where({
                username: newUser.username
            }).first().then(result => {
                if (bcrypt.compareSync(newUser.password, result.password)) {
                    res.status(200).json(result)
                } else {
                    next({
                        message: 'incorrect password '
                    })
                };
            })
        } else {
            next({
                message: 'username and password is required'
            })
        }
    },
    getNotes: (req, res, next) => {
        db('notes')
            .then(result => {
                res.status(200).json(result)
            }).catch(error => next({
                message: error.message,
                status: 500
            }))
    },
    postNote: (req, res, next) => {
        const newNote = req.body;
        newNote.user_id = req.params.user_id;
        if (newNote.text && newNote.user_id) {
            // check if the user exist in db
            db('users')
                .where({
                    id: newNote.user_id
                }).first()
                .then(result => {
                    // add new note if result isnt not undefined
                    if (result) {
                        db('notes').insert(newNote).then(result => {
                            res.status(200).json(result)
                        }).catch(error => next({
                            // handle error incase db didnt add the new note
                            message: error.message,
                            status: 401
                        }))
                    } else {
                        next({
                            message: "wrong user id, try again",
                            status: 401
                        })
                    }
                }).catch(error => next({
                    // handle error incase user didnt exist
                    message: error.message,
                    status: 500
                }))
        } else {
            next({
                message: "user id and text is reqired",
                status: 401
            })
        }
    },
    getANote: (req, res, next) => {
        //check if the note id is valid and exist in db, and handle appropirate cases. 
        const user_id = req.params.user_id;
        const note_id = req.params.note_id;
        if (note_id) {
            db('notes').where({
                    user_id: user_id,
                    id: note_id
                }).first()
                .then(result => {
                    // check if the giving note id is valid
                    res.status(200).json(result)

                })
                .catch(error => {
                    next({
                        message: error.message,
                        status: 500
                    })
                })

        }
    },
    deleteNote: (req, res, next) => {
        const note_id = req.params.note_id;
        db('notes')
            .where({
                id: note_id
            }).del()
            .then(result => {
                // send status 200 in success             
                res.status(200).json(result)
            }).catch(error => next({
                // handle error incase db didnt delet note
                message: error.message,
                status: 500
            }))


    },
    verifyUser: (req, res, next) => {
        if (req.params.user_id) {
            db('users').where({
                id: req.params.user_id
            }).first().then(result => {
                if (result) {
                    next()
                } else {
                    next({
                        message: "wrong user id",
                        status: 401
                    })
                }
            })
        } else {
            next({
                message: "user id is required",
                status: 401
            })
        }
    },
    verifyNote: (req, res, next) => {
        if (req.params.note_id) {
            db('notes').where({
                id: req.params.note_id
            }).first().then(result => {
                if (result) {
                    next()
                } else {
                    next({
                        message: "wrong note id",
                        status: 401
                    })
                }
            })
        } else {
            next({
                message: "note id is required",
                status: 401
            })
        }
    }
}