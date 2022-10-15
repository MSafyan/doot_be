const mongoose = require('mongoose');

const nftSchema = mongoose.Schema({
    type: String,
    method: String,
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    minPrice: Number,
    royalties: Number,
    earn: {
        type: Number,
        default: 0
    },
    usedCopies: {
        type: Number,
        default: 0
    },
    availableCopies: Number,
    totalCopies: Number,
    imageUrl: String,
    bid_start_date: Date,
    bid_expire_date: Date,
    collectionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collections'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    owner: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    history: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },
            bid: Number,
            message: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    bids: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },
            bid: Number,
            message: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('NFT', nftSchema);