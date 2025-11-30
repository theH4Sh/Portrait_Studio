const express = require('express')
const Product = require('../models/Product')
const mongoose = require('mongoose')
const upload = require('../middleware/upload')

const router = express.Router()

router.get('/product', async (req, res, next) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (error) {
        next(error)
    }
})

router.get('/product/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        //validating id
        if(!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Invalid product id")
            error.status = 400
            return next(error)
        }
        
        const product = await Product.findById(id)
        
        if (!product) {
            const error = new Error("Product Not Found")
            error.status = 404
            return next(error)
        }

        res.status(200).json(product)
    } catch (error) {
        next(error)
    }
})

router.delete('/product/:id', async (req, res, next) => {
     try {
        const { id } = req.params
        //validating id
        if(!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Invalid product id")
            error.status = 400
            return next(error)
        }
        
        const deleteProduct = await Product.findByIdAndDelete(id)
        
        if (!deleteProduct) {
            const error = new Error("Product Not Found")
            error.status = 404
            return next(error)
        }

        res.status(200).json({ message: 'Product Deleted Successfully', deleteProduct })
    } catch (error) {
        next(error)
    }   
})

router.post('/product', upload.single('productImage'), async (req, res, next) => {
    try {
        const { name, pricePerDay, description, quantity, isActive } = req.body

        if (!req.file) {
            return res.status(400).json({error: 'Product Image Required'})
        }

        const newProduct = new Product({
            name,
            pricePerDay,
            description,
            quantity,
            image: req.file.filename,
            isActive
        })
        
        await newProduct.save()
        res.status(201).json(newProduct)
    } catch (error) {
        next(error)
    }
})

module.exports = router