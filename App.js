// Carregando Módulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');    
    const porta = process.env.porta || 8081;
    const app = express();
    const admin = require('./routes/admin'); //Coleta todas as Rotas
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');

    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');

    require('./models/Categoria');
    const Categoria = mongoose.model('categorias');

    const usuarios = require('./routes/usuario');//importar a rota

    const passport = require('passport');
    require('./config/auth')(passport);

    const bancodedados = require('./config/bancodedados');
   

// Configurações (app.use é MiddLet)
    //Sessão
        //sempre nessa sequencia de codigo
        app.use(session({
            secret:"cursodenode",
            resave:true,
            saveUninitialized:true
        }));

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());

    //Middleware
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null; //armazenar os dados de usuario logado - passport
            next();
        });

    //body-parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    //Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine','handlebars');

    //Mongoose
        mongoose.Promise = global.Promise;
        //modo de conexao nuvem
        mongoose.connect(bancodedados.mongoURI,{ useNewUrlParser: true }).then(()=>{
            console.log("Conectado com Sucesso ao Banco Mongo");            
            
            /*modo de conexão local:
            mongoose.connect('mongodb://localhost/blogApp',{ useNewUrlParser: true }).then(()=>{
            console.log("Conectado com Sucesso ao Banco Mongo"); 
            */
        }).catch((erro)=>{
            console.log("Erro ao Conectar:" + erro);
        })

    //Public
        app.use(express.static(path.join(__dirname,'public'))); //Serve para pegar o caminho correto da pasta


// Rotas
        app.get('/',(req,res)=>{
            Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
                res.render('index',{postagens: postagens});
            }).catch((erro)=>{
                req.flash('error_msg',"Houve um erro interno");
                res.redirect('/404!');
            })
        });

        app.get('/404',(req,res)=>{
            res.send("Erro 404");
        })

        app.get('/categorias',(req,res)=>{
            Categoria.find().then((categorias)=>{
                res.render('categorias/index',{categorias:categorias});
            }).catch((erro)=>{
                req.flash('error_msg',"Houve um erro interno ao listar a categoria");
                res.redirect('/');
            })
        })   
        
        app.get('/categorias/:slug',(req,res)=>{
            //essa rota é para mostrar as categorias ao clicar no link categorias e selecionar todas
            Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
                if (categoria) {
                    Postagem.find({categoria: categoria._id}).then((postagens)=>{
                        res.render('categorias/postagens',{postagens: postagens , categoria: categoria});
                    }).catch((erro)=>{
                        req.flash('error_msg',"Houve um erro ao listar as postagens referentes a categoria selecionada.");
                        res.redirect('/');
                    })
                }else{
                    req.flash('error_msg',"Esta categoria não existe.");
                    res.redirect('/');
                }

            }).catch((erro)=>{
                req.flash('error_msg',"Houve um erro interno");
                req.redirect('/');
            })
        })

        app.get('/postagem/:slug',(req,res)=>{
            Postagem.findOne({slug:req.params.slug}).then((postagem)=>{
                if(postagem){
                    res.render('postagem/index',{postagem:postagem});
                }else{
                    req.flash('error_msg',"Esta postagem não existe!");
                    res.redirect('/');
                }
            }).catch((erro)=>{
                req.flash('error_msg',"Houve um erro interno.");
                res.redirect('/');
            })
        });


        app.use('/admin',admin); //prefixo de /admin na URL após a porta para usar a pagina administrativa do Blog
        app.use('/usuarios',usuarios);//importar rota


// Server

        app.listen(porta,()=>{
            console.log("Servidor Iniciado com Sucesso");
        })

