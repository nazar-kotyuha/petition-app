const express = require('express');
const router = express.Router();
const petitionController = require('../controllers/petitionController');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');

/**
 * App Routes
 */

router.get('/', petitionController.homepage);
router.get('/categories', petitionController.exploreCategories);
router.get('/categories/:id', checkUser, petitionController.exploreCategorieById);
router.get('/petition/:id', petitionController.explorePetition);
router.get('/edit/petition/:id', requireAuth, petitionController.editPetition);
router.put('/edit-petition/:id', requireAuth, petitionController.editPetitionOnPut);
router.delete('/petition/:id', requireAuth, petitionController.deletePetitionOnDelete);
router.post('/search', checkUser, petitionController.searchPetition);
router.get('/explore-latest', petitionController.exploreLatest);
router.get('/explore-random', petitionController.exploreRandom);
router.get('/submit-petition', requireAuth, checkUser, petitionController.submit);
router.post('/submit-petition', requireAuth, petitionController.submitOnPost);

router.delete('/petition/retract/:id', requireAuth, checkUser, petitionController.voteOnDelete);
router.post('/petition/vote/:id', requireAuth, checkUser, petitionController.voteOnPost);

router.get('/edit/category/:id', requireAuth, petitionController.editCategory);
router.put('/edit/category/:id', requireAuth, petitionController.editCategoryOnPut);
router.get('/submit-category', requireAuth, checkUser, petitionController.submitCategory);
router.post('/submit-category', requireAuth, petitionController.submitCategoryOnPost);
router.delete('/categories/:id', requireAuth, petitionController.deleteCategoryOnDelete);

router.get('/contact', petitionController.contact);
router.get('/about', petitionController.about);

router.delete('/user/:id', requireAuth, checkUser, petitionController.deleteUserOnDelete);

module.exports = router;