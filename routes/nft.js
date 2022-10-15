const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth');
const { createNFT, saveUnsaveNFT, getAllNFT, getUserNFT, getOwnedNFT, buyFixedNFT, getTopCollectors, buyAuctionNFT, getSavedNFT, getActiveNFT, getAllCollectionsNFT, getSingleNFT, getSingleCollectionNFT, getMyCollectionNFT, buyOpenNFT } = require('../controllers/nft.controller');

router.route('/nft/create').post(isAuthenticated, createNFT)
router.route('/nft/saved').get(isAuthenticated, getSavedNFT)
router.route('/nft/all').get(getAllNFT)
router.route('/nft/active').get(getActiveNFT)
router.route('/nft/collections').get(getAllCollectionsNFT)
router.route('/nft/collectors').get(getTopCollectors)
router.route('/nft/collection/my/:id').get(getMyCollectionNFT)
router.route('/nft/collection/:uid/:cid').get(getSingleCollectionNFT)
router.route('/nft/user/:id').get(getUserNFT)
router.route('/nft/owned/:id').get(getOwnedNFT)
router.route('/nft/save/:id').put(isAuthenticated, saveUnsaveNFT)
router.route('/nft/fixed/:id').post(isAuthenticated, buyFixedNFT)
router.route('/nft/auction/:id').post(isAuthenticated, buyAuctionNFT)
router.route('/nft/open/:id').post(isAuthenticated, buyOpenNFT)
router.route('/nft/:id').get(getSingleNFT)

module.exports = router;