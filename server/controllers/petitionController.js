require('../models/database')
const fs = require("fs");
const Category = require('../models/Category');
const Petition = require('../models/Petition');
const User = require('../models/User');
const PetitionVote = require('../models/PetitionVote');

/**
 * GET /
 * Homepage
 */

exports.homepage = async(req,res) => {  

  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);

    const latest = await Petition.find({}).sort({_id: -1}).limit(limitNumber)
    const petitions = { latest };
    res.render('index', {title: 'Petition app - Home', categories, petitions});  
  } catch (error){
    res.status(500).send({message: error.message || "Error occured" })
  }

}

/**
 * GET /categories
 * Categories
 */
exports.exploreCategories = async(req,res) => {  

  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', {title: 'Petition app - Categories', categories});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /categories/:id
 * Category page
 */
exports.exploreCategorieById = async(req,res) => {  

  try {
    let categoryId = req.params.id;

    const petitionsByCategory = await Petition.find({'category': categoryId});
    const currentCategory = await Category.findById(categoryId);
    
    res.render('categories', {title: `Petition app - ${currentCategory.name}`, currentCategory, petitionsByCategory});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /petition/:id
 * Petiton page
 */
exports.explorePetition = async(req,res) => {  

  try {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    let petitionId = req.params.id;

    const petition = await Petition.findById(petitionId);
    const author = await User.findById(petition.creator)
    const votes = await PetitionVote.find({petition: petitionId})
    
    res.render('petition', {title: `Petition app - ${petition.name}`, petition, author, infoErrorsObj, infoSubmitObj, votes});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * DELETE /petition/:id
 * Petiton deletion
 */
exports.deletePetitionOnDelete = async(req,res) => {  

  try {
    const petitionId = req.params.id;
    const petition = await Petition.findById(petitionId);

    // Delete the associated image file if it exists
    deletePetition(petitionId)

    res.redirect("/")
    //res.render('home', {title: `Petition app - ${petition.name}`, petition});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /edit/petition/:id
 * Edit Petiton 
 */
exports.editPetition = async(req,res) => {  

  try {
    let petitionId = req.params.id;
    const petition = await Petition.findById(petitionId);
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    const categories = await Category.find({});
    res.render('edit-petition', {title: 'Petition app - Edit your petition', petition, categories, infoErrorsObj, infoSubmitObj});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * PUT /edit-petition
 * Edit Petiton 
 */
exports.editPetitionOnPut = async(req,res) => {  

  try {
    if(!req.files || Object.keys(req.files).length === 0){
      await Petition.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        petitionText: req.body.petitionText,
        category: req.body.category,
        tags: req.body.tags
      });
    } else {
      const category = await Category.findById(req.params.id);
      fs.unlinkSync(category.image);

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);
      })

      await Petition.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        petitionText: req.body.petitionText,
        creator: req.body.creator,
        category: req.body.category,
        tags: req.body.tags,
        image: newImageName
      });
    }
    
    res.redirect(`/petition/${req.params.id}`);
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * POST /search
 * Search petition
 */
exports.searchPetition = async(req,res) => {  

  try {
    let searchTerm = req.body.searchTerm;

    let filtredBySearchTerm = await Petition.find({ $text: {$search: searchTerm, $diacriticSensitive: true}})
    let petitions = { filtredBySearchTerm };
    res.render('search', {title: 'Petition app - Search', petitions});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /explore-latest
 * Explore latest petitions
 */
exports.exploreLatest = async(req,res) => {  

  try {
    const limitNumber = 20;
    const petitions = await Petition.find({}).sort({_id: -1}).limit(limitNumber);

    res.render('explore-latest', {title: 'Petition app - Explore latest', petitions});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /explore-random
 * Explore random petitions
 */
exports.exploreRandom = async(req,res) => {  

  try {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    let count = await Petition.find().countDocuments();
    let random = Math.floor(Math.random() * count);

    let petition = await Petition.findOne().skip(random).exec();
    const author = await User.findById(petition.creator);
    const votes = await PetitionVote.find({petition: petition._id})
    res.render('petition', {title: 'Petition app - Explore random', petition, author, infoErrorsObj, infoSubmitObj, votes});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /submit-petition
 * Submit new petition
 */
exports.submit = async(req,res) => {  

  try {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    const categories = await Category.find({});
    res.render('submit-petition', {title: 'Petition app - Submit your petition', categories, infoErrorsObj, infoSubmitObj});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}


/**
 * POST /submit-petition
 * Submit new petition
 */
exports.submitOnPost = async(req,res) => {  

  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      throw new Error("Image wasn't uploaded")
    }

    imageUploadFile = req.files.image;
    newImageName = Date.now() + imageUploadFile.name;

    uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

    imageUploadFile.mv(uploadPath, function(err){
      if(err) return res.status(500).send(err);
    })

    const newPetition = new Petition({
      name: req.body.name,
      description: req.body.description,
      petitionText: req.body.petitionText,
      creator: req.body.creator,
      createdAt: req.body.createdAt,
      category: req.body.category,
      tags: req.body.tags,
      image: newImageName
    });

    await newPetition.save();
    

    req.flash('infoSubmit', 'Petition has been added.')
  } catch (error){
    
    req.flash('infoErrors', error.message.toString())
    //res.status(500).send({message: error.message || "Error occured"})
  } finally{
    res.redirect('/submit-petition')
  }

}

/**
 * POST /petition/vote
 * Submit new petition
 */
exports.voteOnPost = async(req,res) => {  
  const petitionId = req.params.id;
  try {
    const currentUser = res.locals.user;
    const userVote = await PetitionVote.create({petition: petitionId, user: currentUser._id})

    req.flash('infoSubmit', 'Your vote has been counted.')
  } catch (error){
    console.log(error);
    req.flash('infoErrors', error.message)
    //res.status(500).send({message: error.message || "Error occured"})
  } finally{
    res.redirect(`/petition/${petitionId}`)
  }

}

/**
 * DELETE /petition/vote
 * Retract new petition
 */
exports.voteOnDelete = async(req,res) => {  
  const petitionId = req.params.id;
  try {
    const currentUser = res.locals.user;
    
    await PetitionVote.findOneAndDelete({petition: petitionId, user: currentUser._id})

    req.flash('infoSubmit', 'Your vote has been retracted.')
  } catch (error){
    console.log(error);
    req.flash('infoErrors', error.message)
    //res.status(500).send({message: error.message || "Error occured"})
  } finally{
    res.redirect(`/petition/${petitionId}`)
  }
}

/**
 * GET /edit-category/:id
 * Edit category 
 */
exports.editCategory = async(req,res) => {  

  try {
    let categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');
    
    res.render('edit-category', {title: 'Petition app - Edit your petition', category, infoErrorsObj, infoSubmitObj});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * PUT /edit-petition/:id
 * Edit category 
 */
exports.editCategoryOnPut = async(req,res) => {  

  try {
    if(!req.files || Object.keys(req.files).length === 0){
      await Category.findByIdAndUpdate(req.params.id,{
        name: req.body.name
      });
    } else {
      const category = await Category.findById(req.params.id);
      fs.unlinkSync(category.image);

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);
      })

      await Category.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        image: newImageName
      });
    }
    
    res.redirect(`/categories/${req.params.id}`);
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}


/**
 * GET /submit-category
 * Submit new category
 */
exports.submitCategory = async(req,res) => {  

  try {
    const infoErrorsObj = req.flash('infoErrors');
    const infoSubmitObj = req.flash('infoSubmit');

    res.render('submit-category', {title: 'Petition app - Submit your category', infoErrorsObj, infoSubmitObj});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}


/**
 * POST /submit-petition
 * Submit new petition
 */
exports.submitCategoryOnPost = async(req,res) => {  

  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      throw new Error("Image wasn't uploaded")
    }

    imageUploadFile = req.files.image;
    newImageName = Date.now() + imageUploadFile.name;

    uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

    imageUploadFile.mv(uploadPath, function(err){
      if(err) return res.status(500).send(err);
    })

    const newCategory = new Category({
      name: req.body.name,
      creator: req.body.creator,
      image: newImageName
    });

    await newCategory.save();
    

    req.flash('infoSubmit', 'Category has been added.')
  } catch (error){
    req.flash('infoErrors', error.message)
    //res.status(500).send({message: error.message || "Error occured"})
  } finally{
    res.redirect('/submit-category')
  }

}

/**
 * DELETE /categories/:id
 * Category deletion
 */
exports.deleteCategoryOnDelete = async(req,res) => {  

  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    deleteCategory(categoryId);
    res.redirect("/")
    //res.render('home', {title: `Petition app - ${petition.name}`, petition});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/**
 * GET /about
 * Get about
 */
exports.about = async(req,res) => {  

  try {
    res.render('about', {title: 'Petition app - About'})
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

/**
 * GET /contact
 * Get contact
 */
exports.contact = async(req,res) => {  

  try {
    res.render('contact', {title: 'Petition app - Contact'})
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }
}

async function deletePetition(petitionId){
  let petition = await Petition.findById(petitionId)
  if (petition && petition.image) {
    const imagePath = require('path').resolve('./public/uploads/') + '/' + petition.image;
    fs.unlinkSync(imagePath);
  }
  await PetitionVote.deleteMany({petition: petitionId})
  await Petition.findByIdAndDelete(petitionId)
}

async function deleteCategory(categoryId){
  let category = await Category.findById(categoryId)
  if (category && category.image) {
    const imagePath = require('path').resolve('./public/uploads/') + '/' + category.image;
    fs.unlinkSync(imagePath);
  }
  let petitionsByCategory = await Petition.find({category: categoryId})
  petitionsByCategory.forEach(async petition => {
    await deletePetition(petition._id);
  })
  await Category.findByIdAndDelete(categoryId)
}

/**
 * DELETE /user/:id
 * User deletion
 */
exports.deleteUserOnDelete = async(req,res) => {  

  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    let petitionsByUser = await Petition.find({creator: user._id})
    if(petitionsByUser){
      petitionsByUser.forEach(async petition => {
        deletePetition(petition._id);
      })
    }

    let category = await Category.find({creator: user._id})
    if(category){
      deleteCategory(category._id);
    }

    await User.findByIdAndDelete(userId);

    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
    //res.render('home', {title: `Petition app - ${petition.name}`, petition});
  } catch (error){
    res.status(500).send({message: error.message || "Error occured"})
  }

}

/*
async function seedCategoryData(){
    try{
        await Category.insertMany(
            [
                {
                  "name": "Environment",
                  "image": "environment.jpeg",
                  "creator": "646d27aa3d81c5e19e6e0431"
                },
                {
                  "name": "Human Rights",
                  "image": "human_rights.jpeg",
                  "creator": "646d27aa3d81c5e19e6e0431"
                },
                {
                  "name": "Education",
                  "image": "education.jpeg",
                  "creator": "646d27aa3d81c5e19e6e0431"
                },
                {
                  "name": "Healthcare",
                  "image": "healthcare.jpeg",
                  "creator": "646d27aa3d81c5e19e6e0431"
                },
                {
                  "name": "Animal Welfare",
                  "image": "animal_welfare.jpeg",
                  "creator": "646d27aa3d81c5e19e6e0431"
                }
              ]
              
        );
    }catch(error){
        console.log(`err: ${error}`)
    }
}

seedCategoryData();

async function seedPetitionData(){
  try{
      await Petition.insertMany(
        [
          {
            "name": "Social Justice",
            "description": "Petitions advocating for equal rights, fairness, and societal change.",
            "creator": "646d27aa3d81c5e19e6e0431",
            "createdAt": "2023-05-20T10:30:00.000Z",
            "category": "646e0b0babbd23b3c6199036",
            "tags": ["equality", "human rights", "activism"],
            "image": "social-justice.jpg",
            "petitionText": "We, the undersigned, urge for social justice and equality in all aspects of society. It is time to address systemic discrimination, promote inclusivity, and fight for the rights of every individual. Together, we can create a fair and just world for all."
          },
          {
            "name": "Environmental Conservation",
            "description": "Petitions focused on protecting the environment, wildlife, and addressing climate change.",
            "creator": "646d27aa3d81c5e19e6e0431",
            "createdAt": "2023-05-19T15:45:00.000Z",
            "category": "646e0b0babbd23b3c6199035",
            "tags": ["sustainability", "climate action", "nature preservation"],
            "image": "environmental-conservation.jpg",
            "petitionText": "We call upon policymakers and organizations to prioritize environmental conservation and take immediate action to combat climate change. Our planet's future is at stake, and we must work together to protect our natural resources, preserve biodiversity, and create a sustainable future."
          },
          {
            "name": "Education Reform",
            "description": "Petitions advocating for improvements in the education system and educational policies.",
            "creator": "646d27aa3d81c5e19e6e0431",
            "createdAt": "2023-05-18T09:15:00.000Z",
            "category": "646e0b0babbd23b3c6199037",
            "tags": ["schooling", "learning", "student rights"],
            "image": "education-reform.jpg",
            "petitionText": "We demand comprehensive education reform to ensure quality education for all students. It is crucial to address issues such as funding, curriculum development, teacher training, and access to educational resources. Together, we can create an inclusive and equitable education system."
          },
          {
            "name": "Healthcare Access",
            "description": "Petitions advocating for affordable and accessible healthcare for all.",
            "creator": "646d27aa3d81c5e19e6e0431",
            "createdAt": "2023-05-17T14:20:00.000Z",
            "category": "646e0b0babbd23b3c6199038",
            "tags": ["health", "medical care", "equality"],
            "image": "healthcare-access.jpg",
            "petitionText": "We urge for affordable and accessible healthcare for all individuals, regardless of their socioeconomic status. Everyone deserves the right to quality medical care and treatments. Let's come together to ensure that healthcare is a fundamental right for everyone."
          },
          {
            "name": "Criminal Justice Reform",
            "description": "Petitions focused on reforming the criminal justice system and promoting justice and fairness.",
            "creator": "646d27aa3d81c5e19e6e0431",
            "createdAt": "2023-05-16T11:10:00.000Z",
            "category": "646e0b0babbd23b3c6199036",
            "tags": ["prison reform", "police accountability", "human rights"],
            "image": "criminal-justice-reform.jpg",
            "petitionText": "We demand comprehensive criminal justice reform to address issues of systemic bias, police accountability, and fairness in the legal system. Together, we can create a justice system that upholds the rights and dignity of all individuals."
          },
          {
            "name": "Animal Rights",
            "description": "Petitions advocating for the protection and welfare of animals.",
            "creator": "646d27aa3d81c5e19e6e0431",
            "createdAt": "2023-05-15T16:35:00.000Z",
            "category": "646e0b0babbd23b3c6199039",
            "tags": ["animal welfare", "cruelty-free", "endangered species"],
            "image": "animal-rights.jpg",
            "petitionText": "We call for stronger laws and regulations to protect the rights and welfare of animals. It is our responsibility to ensure that animals are treated with compassion and respect. Let's take a stand against animal cruelty and work towards a more compassionate world."
          }
        ]
             
            
      );
  }catch(error){
      console.log(`err: ${error}`)
  }
}

seedPetitionData();*/