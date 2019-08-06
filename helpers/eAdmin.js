module.exports = {
    eAdmin: function(req,res,next){
        //verificar se o usuario logado é eAdmin 
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            return next();
        }

        req.flash('error_msg',"Acesso permitido apenas para administrador.");
        res.redirect('/');
    }
}