const { saveImages } = require('../helper/image');
const { nftData } = require('../helper/nftdata');
const User = require('../models/User');
const Collection = require('../models/collection');
const NFT = require('../models/nft');
const json = require('../utils/jsonresponse');

// Create NFT
exports.createNFT = async (req, res) => {
    try {
        if (!req.files?.image) return json(res, 400, "Image Required")

        let isCollection = await Collection.findOne({ collectionName: req.body.collection })
        if (isCollection) {
            if (isCollection.owner.toString() !== req.user._id.toString()) return json(res, 500, "Try another collection name")
        } else {
            isCollection = await Collection.create({ collectionName: req.body.collection, owner: req.user._id })
        }

        const imagePath = saveImages(req, "nft")
        const data = nftData(req, imagePath, isCollection._id)
        const nft = await NFT.create(data)
        json(res, 201, null, nft)
    } catch (error) {
        json(res, 500, error.message);
    }
}

// save/unSave NFT
exports.saveUnsaveNFT = async (req, res) => {
    try {
        const nft = await NFT.findById(req.params.id);
        if (!nft) return json(res, 404, "NFT not Found");

        if (!nft.likes.includes(req.user._id)) {
            await nft.updateOne({ $push: { likes: req.user._id } });
            json(res, 200, "NFT Saved")
        } else {
            await nft.updateOne({ $pull: { likes: req.user._id } });
            json(res, 200, "NFT unSaved");
        }
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get user NFTs
exports.getUserNFT = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return json(res, 404, "User not Found");

        const nft = await NFT.find({ creator: req.params.id }).sort({ createdAt: -1 }).populate("creator collectionID");
        json(res, 200, null, nft);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get single NFT
exports.getSingleNFT = async (req, res) => {
    try {
        const nft = await NFT.findById(req.params.id).populate("creator collectionID history.user");
        json(res, 200, null, nft);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get all NFTs
exports.getAllNFT = async (req, res) => {
    try {
        const nft = await NFT.find({}).sort({ createdAt: -1 }).populate("creator collectionID");
        json(res, 200, null, nft);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get owned NFTs
exports.getOwnedNFT = async (req, res) => {
    try {
        const nft = await NFT.find({ owner: { $in: req.params.id } }).sort({ createdAt: -1 }).populate("creator collectionID");
        json(res, 200, null, nft);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get saved NFTs
exports.getSavedNFT = async (req, res) => {
    try {
        const nft = await NFT.find({ likes: { $in: req.user._id } }).sort({ createdAt: -1 }).populate("creator collectionID");
        json(res, 200, null, nft);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get saved NFTs
exports.getActiveNFT = async (req, res) => {
    try {
        const nft = await NFT.find({ availableCopies: { $not: { $eq: 0 } } }).sort({ createdAt: -1 }).populate("creator collectionID");
        json(res, 200, null, nft);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get All Collections NFT
exports.getAllCollectionsNFT = async (req, res) => {
    try {
        const collection = await Collection.find({}).sort({ createdAt: -1 }).populate("owner");
        json(res, 200, null, collection);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get my Collection NFT
exports.getMyCollectionNFT = async (req, res) => {
    try {
        const collections = await Collection.find({ owner: req.params.id }).populate("owner");
        json(res, 200, null, collections);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get single Collection NFT
exports.getSingleCollectionNFT = async (req, res) => {
    try {
        const collection = await Collection.findOne({ _id: req.params.cid, owner: req.params.uid }).populate("owner");
        const nfts = await NFT.find({ collectionID: req.params.cid }).sort({ createdAt: -1 }).populate("creator");
        const data = { collection, nfts }
        json(res, 200, null, data);
    } catch (error) {
        json(res, 500, error.message);
    }
}

// get top collectors NFTs
exports.getTopCollectors = async (req, res) => {
    try {
        const user = await User.find({});
        let collectors = []

        let totalEarnings = 0;
        for (let i = 0; i < user.length; i++) {
            const nft = await NFT.find({ creator: user[i]._id }).sort({ createdAt: -1 }).populate("creator");
            for (let j = 0; j < nft.length; j++) {
                totalEarnings += (nft[j].usedCopies * nft[j].earn);
            }
            if (totalEarnings > 0) {
                collectors.push({ userId: user[i]._id, fullname: user[i].fullname, avatar: user[i].avatar, totalEarnings })
            }
            totalEarnings = 0;
        }
        json(res, 200, null, { collectors });
    } catch (error) {
        json(res, 500, error.message);
    }
}

// buy fixed NFT
exports.buyFixedNFT = async (req, res) => {
    try {
        const { quantity } = req.body;
        const isNFT = await NFT.findById(req.params.id);
        let history;

        if (!isNFT) return json(res, 404, "NFT not Found");
        if (req.user.id.toString() === isNFT.creator.toString()) return json(res, 401, "Unauthorized");

        if (isNFT.type === "single" && isNFT.method === "fixed") {
            if (isNFT.availableCopies <= 0) {
                return json(res, 400, "NFT sold out already");
            } else {
                history = {
                    user: req.user._id,
                    bid: isNFT.minPrice,
                    message: 'Buy'
                }
                await isNFT.updateOne({ usedCopies: 1, availableCopies: 0, $push: { owner: req.user._id, history: history } })
                return json(res, 200, "NFT owned successfully");
            }
        }
        else if (isNFT.type === "multi" && isNFT.method === "fixed") {
            if (isNFT.availableCopies <= 0) {
                return json(res, 400, "NFT sold out already");
            } else {
                history = {
                    user: req.user._id,
                    bid: isNFT.minPrice * quantity,
                    message: 'Buy'
                }
                if (!isNFT.owner.includes(req.user._id)) {
                    await isNFT.updateOne({ $inc: { usedCopies: quantity, availableCopies: -quantity }, $push: { owner: req.user._id, history: history } })
                } else {
                    await isNFT.updateOne({ $inc: { usedCopies: quantity, availableCopies: -quantity }, $push: { history: history } })
                }
                return json(res, 200, "NFT owned successfully");
            }
        }

    } catch (error) {
        json(res, 500, error.message);
    }
}

// buy auction NFT
exports.buyAuctionNFT = async (req, res) => {
    try {
        const isNFT = await NFT.findById(req.params.id);
        if (!isNFT) return json(res, 404, "NFT not Found");

        if (req.user.id.toString() === isNFT.creator.toString()) return json(res, 401, "Unauthorized");

        if (isNFT.type === "single" && isNFT.method === "auction") {
            const NFTexpired = await NFT.find({ $and: [{ _id: req.params.id }, { bid_expire_date: { $lt: Date.now() } }] })
            if (NFTexpired.length > 0) {
                return json(res, 400, "NFT Expired")
            }
            if (isNFT.availableCopies <= 0) {
                return json(res, 400, "NFT sold out already");
            } else {
                const data = {
                    user: req.user._id,
                    bid: req.body.bid,
                    message: 'Bid'
                }
                // await isNFT.updateOne({ usedCopies: 1, availableCopies: 0, $push: { bids: data, history: data } })
                await isNFT.updateOne({ minPrice: req.body.bid, $push: { bids: data, history: data } })
                return json(res, 200, "Bid added successfully");
            }
        } else {
            return json(res, 400, "Not Auction NFT")
        }
    } catch (error) {
        json(res, 500, error.message);
    }
}

// buy open NFT
exports.buyOpenNFT = async (req, res) => {
    try {
        const { quantity, bid } = req.body;
        const isNFT = await NFT.findById(req.params.id);
        let history;

        if (!isNFT) return json(res, 404, "NFT not Found");
        if (req.user.id.toString() === isNFT.creator.toString()) return json(res, 401, "Unauthorized");

        if (isNFT.type === "single" && isNFT.method === "open") {
            if (isNFT.availableCopies <= 0) {
                return json(res, 400, "NFT sold out already");
            } else {
                history = {
                    user: req.user._id,
                    bid,
                    message: 'Bid'
                }
                await isNFT.updateOne({ minPrice: bid, $push: { bids: history, history } })
                return json(res, 200, "Bid added successfully");
            }
        }
        else if (isNFT.type === "multi" && isNFT.method === "open") {
            if (isNFT.availableCopies <= 0) {
                return json(res, 400, "NFT sold out already");
            } else {
                history = {
                    user: req.user._id,
                    bid: bid * quantity,
                    message: 'Bid'
                }
                await isNFT.updateOne({ minPrice: bid, $push: { bids: history, history } })
                return json(res, 200, "Bid added successfully");
            }
        }
    } catch (error) {
        json(res, 500, error.message);
    }
}