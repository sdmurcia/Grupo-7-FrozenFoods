const res = require("express/lib/response");
const fs = require("fs");
const bcryptjs = require("bcryptjs");
const path = require("path");
const User = require('../models/Users')

//función que trae los errores desde la ruta.
const { validationResult } = require("express-validator");

const usersController = {
  signIn: (req, res) => {
    res.render("signIn", { req: req });
  },
  signUp: (req, res) => {
    res.render("signUp");
  },
  carrito: (req, res) => {
    res.render("carrito");
  },
  create: (req, res) => {
    const resultValidation = validationResult(req);
    if(resultValidation.errors.length > 0){
      return res.render("signUp",{
        errors: resultValidation.mapped(),
        oldData: req.body
      })
    }
    let userInDB = User.findByField('email', req.body.email);

		if (userInDB) {
			return res.render('userRegisterForm', {
				errors: {
					email: {
						msg: 'Este email no esta disponible'
					}
				},
				oldData: req.body
			});
		}

		let userToCreate = {
			...req.body,
			password: bcryptjs.hashSync(req.body.password, 10),
			avatar: req.file.filename
		}

		let userCreated = User.create(userToCreate);

		return res.redirect('/users/signIn');

  },
  access: (req, res) => {
    let userToLogin = User.findByField('email', req.body.email);
		
		if(userToLogin) {
			let passwordCompare = bcryptjs.compareSync(req.body.password, userToLogin.password);
			if (passwordCompare) {
				delete userToLogin.password;
				req.session.userLogged = userToLogin;
				return res.redirect('/users/profile');
			} 
			return res.render('signIn', {
				errors: {
					email: {
						msg: 'Las credenciales son incorrectas'
					}
				}
			});
		}

		return res.render('signIn', {
			errors: {
				email: {
					msg: 'email no registrado'
				}
			}
		});
  },
  profile: (req, res) => {
		return res.render('profile', {
			user: req.session.userLogged
		});
	},
};

module.exports = usersController;
