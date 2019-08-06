const express = require('express');
const router = express.Router(); //Serve para Criar Rotas com Arquivos Separados

//importar o mongoose e o models
const mongoose = require('mongoose');

require('../models/Categoria');
const Categoria = mongoose.model('categorias');

require('../models/Postagem');
const Postagem = mongoose.model('postagens');

const {eAdmin} = require('../helpers/eAdmin'); // pegando somente a função eAdmin com o objeto {}



//rotas

    router.get('/', eAdmin, (req,res)=>{
        res.render('admin/index');
    });

    router.get('/posts',eAdmin, (req,res)=>{
        res.send("Pagina de Posts");
    });

    router.get('/categorias', eAdmin, (req,res)=>{
        Categoria.find().sort({date:'desc'}).then((categorias)=>{
            res.render('admin/categorias',{categorias:categorias});
        }).catch((erro)=>{
            req.flash('error_msg',"Houve uma falha ao Listar as Categorias");
            res.redirect('/admin');
        })
        
    });

    router.get('/categorias/add', eAdmin, (req,res)=>{
        res.render('admin/addcategorias');
    })

    router.post('/categorias/nova', eAdmin, (req,res)=>{
        //Verificando os campos se está vazio e tamanho
        var erros=[]
            if(!req.body.nome ||typeof req.body.nome == undefined || req.body.nome == null){
                erros.push({texto:"Nome Inválido"});
            }
            if(!req.body.slug ||typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto:"Slug Inválido"});
            }
            if(req.body.nome.length < 2){
                erros.push({texto:"Nome da Categoria está Muito Pequeno"});                
            }
            if(erros.length > 0){
                res.render('admin/addcategorias',{erros:erros});
            }
            else{
                const novaCategoria = {
                    nome:req.body.nome,
                    slug:req.body.slug
                }
        
                new Categoria(novaCategoria).save().then(()=>{
                    req.flash("success_msg","Categoria criada com sucesso.");
                    res.redirect('/admin/categorias');
                }).catch((erro)=>{
                    req.flash("error_msg","Houve um erro ao salvar a categoria, tente novamente!");
                    req.redirect('/admin');
                });                
            }

    });

    router.get('/categorias/editar/:id', eAdmin, (req,res)=>{
        Categoria.findOne({_id:req.params.id}).then((categoria)=>{
            res.render('admin/editarcategorias', {categoria:categoria});
        }).catch((erro)=>{
            req.flash('error_msg',"Esta categoria não existe");
            res.redirect('/admin/categorias');
        });
        
    });

    router.post('/categorias/atualizar', eAdmin, (req,res)=>{
        //Verificando os campos se está vazio e tamanho
        var erros=[]
            if(!req.body.nome ||typeof req.body.nome == undefined || req.body.nome == null){
                erros.push({texto:"Nome Inválido"});
            }
            if(!req.body.slug ||typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto:"Slug Inválido"});
            }
            if(req.body.nome.length < 2){
                erros.push({texto:"Nome da Categoria está Muito Pequeno"});                
            }
            if(erros.length > 0){
                res.render('admin/editarcategorias',{erros:erros});
            }
            else{
                    Categoria.findOne({_id:req.body.id}).then((categoria)=>{
                        categoria.nome=req.body.nome
                        categoria.slug=req.body.slug

                        categoria.save().then(()=>{
                            req.flash('success_msg',"Categoria atualizada com Sucesso!");
                            res.redirect('/admin/categorias');
                        }).catch((erro)=>{
                            req.flash('error_msg',"Houve um erro interno");
                            res.redirect('/admin/categorias');
                        });
                    }).catch((erro)=>{
                        req.flash('error_msg',"Houve um erro ao editar a categoria");
                        res.redirect('/admin/categorias');
                    });
                }
    });

    router.post('/categorias/deletar', eAdmin, (req,res)=>{
        Categoria.deleteOne({_id:req.body.id}).then(()=>{
            req.flash('success_msg',"Categoria deletada com sucesso!");
            res.redirect('/admin/categorias');
        }).catch((erro)=>{
            req.flash('error_msg',"Houve um erro ao deletar a categoria");
            res.redirect('/admin/categorias');
        });
    });

    router.get('/postagens', eAdmin, (req,res)=>{
        //Comando Populate serve para mostrar os dados na pagina
        Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens)=>{
            res.render('admin/postagens',{postagens: postagens});
        }).catch((erro)=>{
            req.flash('error_msg',"Houve um erro ao listar as postagens");
            res.redirect('/admin');
        })        
    });

    router.get('/postagens/add', eAdmin, (req,res)=>{
        Categoria.find().then((categorias)=>{
            res.render('admin/addpostagens',{categorias:categorias});
            //req.flash('success_msg',"Postagem cadastrada com sucesso!");
        }).catch((erro)=>{
            req.flash('error_msg',"Houve um erro ao carregar o formulário");
            res.redirect('/admin');
        })        
        
    })

    router.post('/postagens/nova', eAdmin, (req,res)=>{
        //Verificando os campos se está vazio e tamanho
        var erros=[]
            if(!req.body.titulo ||typeof req.body.titulo == undefined || req.body.titulo == null){
                erros.push({texto:"Título Inválido"});
            }
            if(!req.body.slug ||typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto:"Slug Inválido"});
            }
            if(!req.body.descricao ||typeof req.body.descricao == undefined || req.body.descricao == null){
                erros.push({texto:"Descrição Inválida"});                
            }
            if (req.body.categoria=="0"){
                erros.push({texto:"Categoria inválida, registre uma categoria."})
            }
            if(req.body.titulo.length < 2){
                erros.push({texto:"Título está Muito Pequeno"});                
            }
            if(erros.length > 0){
                res.render('admin/addpostagens',{erros:erros});
            }
            
            else{
                const novaPostagem = {
                    titulo:req.body.titulo,
                    descricao:req.body.descricao,
                    conteudo:req.body.conteudo,
                    categoria:req.body.categoria,
                    slug:req.body.slug
                }

                new Postagem(novaPostagem).save().then(()=>{
                    req.flash('success_msg',"Postagem criada com sucesso!");
                    res.redirect('/admin/postagens');
                }).catch((erro)=>{
                    req.flash('error_msg',"Houve um erro ao criar postagem.");
                    res.redirect('/admin/postagens');
                });
            }
    });

    router.get('/postagens/editar/:id', eAdmin, (req,res)=>{
        //Para mostrar os dados nos campos para edição devemos fazer duas pesquisas.
        Postagem.findOne({_id: req.params.id}).then((postagem)=>{
            Categoria.find().then((categorias)=>{
                res.render('admin/editarpostagens',{categorias: categorias, postagem: postagem});
                console.log(categorias._id)
                
            }).catch((erro)=>{
                req.flash('error_msg',"Houve um erro ao listar as categorias!");
                res.redirect('/admin/postagens');
            });
        }).catch((erro)=>{
            req.flash('error_msg',"Houve um erro ao carregar o formulário!");
            res.redirect('/admin/postagens');
        });        
    });

    router.post('/postagem/editado', eAdmin, (req,res)=>{
        //Verificando os campos se está vazio e tamanho
        var erros=[]
            if(!req.body.titulo ||typeof req.body.titulo == undefined || req.body.titulo == null){
                erros.push({texto:"Título Inválido"});
            }
            if(!req.body.slug ||typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto:"Slug Inválido"});
            }
            if(!req.body.descricao ||typeof req.body.descricao == undefined || req.body.descricao == null){
                erros.push({texto:"Descrição Inválida"});                
            }
            if (req.body.categoria=="0"){
                erros.push({texto:"Categoria inválida, registre uma categoria."})
            }
            if(req.body.titulo.length < 2){
                erros.push({texto:"Título está Muito Pequeno"});                
            }
            if(erros.length > 0){
                res.render('admin/editarpostagens',{erros:erros});
            }
            
            else{
                Postagem.findOne({_id: req.body.id}).then((postagem)=>{
                    postagem.titulo = req.body.titulo,
                    postagem.slug = req.body.slug,
                    postagem.descricao = req.body.descricao,
                    postagem.conteudo = req.body.conteudo,
                    postagem.categoria = req.body.categoria

                    postagem.save().then(()=>{
                        req.flash('success_msg',"Postagem atualizada com sucesso.");
                        res.redirect('/admin/postagens');
                    }).catch((erro)=>{
                        req.flash('error_msg',"Erro interno");
                        res.redirect('/admin/postagens');
                    });
                }).catch((error)=>{
                    req.flash('error_msg',"Houve um erro ao atualizar!");
                });
            }

    });

    router.get('/postagens/deletar/:id', eAdmin, (req,res)=>{
        Postagem.deleteOne({_id: req.params.id}).then(()=>{
            req.flash('success_msg',"Postagem deletada com sucesso!");
            res.redirect('/admin/postagens');
        }).catch((erro)=>{
            req.flash('error_msg',"Houve um erro interno!");
            res.redirect('/admin/postagens');
        });
    });





module.exports = router; //Sempre deve ficar no Final