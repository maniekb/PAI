import Axios from 'axios';
import { Card, Icon, Row, Col } from "antd";
import React, { useEffect, useState } from 'react'
import ImageSlider from '../../utils/ImageSlider';
import { PRODUCT_SERVER } from '../../Config.js';
import CheckBox from './Sections/CheckBox.js';
import RadioBox from './Sections/RadioBox';
import { price, manufacturers } from './Sections/Data'
import SearchFeature from './Sections/SearchFeature';
const { Meta } = Card;

function LandingPage() {

    const [Products, setProducts] = useState([])
    const [Skip, setSkip] = useState(0)
    const [Limit, setLimit] = useState(8)
    const [ProductsTotal, setProductsTotal] = useState(0)
    const [SearchTerms, setSearchTerms] = useState("")
    const [Filters, setFilters] = useState({
        manufacturer: [],
        price: []
    })

    useEffect(() => {
        const variables = {
            skip: Skip,
            limit: Limit
        }
        getProducts(variables)
    }, [])

    const renderCars = Products.map((product, index) => {
            return <Col lg={6} md={8} xs={24}>
                <Card 
                    hoverable={true} 
                    cover={<a href={`/product/${product._id}`} > <ImageSlider images={product.images} /></a>}
                >
                    <Meta title={product.title} description={`$${product.price}`}/>
                    
                </Card>
            </Col>
    })

    const getProducts = (variables) => {
        console.log(variables)
        Axios.post(`${PRODUCT_SERVER}/getProducts`, variables)
            .then(response => {
                if(response.data.success) {
                    if(variables.loadMore) {
                        setProducts([...Products, ...response.data.products])
                    } else {
                        setProducts(response.data.products)
                    }
                    setProductsTotal(response.data.total)
                } else {
                    alert('Failed to fetch products.')
                }
            })
    }

    const onLoadMore = () => {
        let skip = Skip + Limit;

        const variables = {
            skip: Skip,
            limit: Limit,
            loadMore: true
        }
        getProducts(variables)
        setSkip(skip)
    }

    const showFilteredResults = (filters) => {
        const variables = {
            skip: 0,
            limit: Limit,
            filters: filters
        }
        getProducts(variables)
        setSkip(0)
    }

    const handlePrice = (value) => {
        const data = price;
        let array = [];

        for (let key in data) {
            if(data[key]._id === parseInt(value, 10)) {
                array = data[key].array;
            }
        }
        return array
    }

    const handleFilters = (filters, category) => {
        const newFilters = { ...Filters }
        newFilters[category] = filters

        if(category === "price") {
            let priceValues = handlePrice(filters)
            newFilters[category] = priceValues
        }

        showFilteredResults(newFilters)
        setFilters(newFilters)
    }

    const updateSearchTerms = (newSearchTerm) => {

        const variables = {
            skip: 0,
            limit: Limit,
            filters: Filters,
            searchTerm: newSearchTerm
        }

        setSkip(0)
        setSearchTerms(newSearchTerm)

        getProducts(variables)
    }

    return (
        <div style={{ width: '75%', margin: '3rem auto'}}>
            <div style={{ textAlign: 'center' }}>
                <h2>Find your dream car<Icon type="rocket" /></h2>
            </div>

            <Row gutter={[16, 16]}>
                <Col lg={12} xs={24} >
                    <CheckBox
                        list={manufacturers}
                        handleFilters={filters => handleFilters(filters, "manufacturer")}
                    />
                </Col>
                <Col lg={12} xs={24}>
                    <RadioBox
                        list={price}
                        handleFilters={filters => handleFilters(filters, "price")}
                    />
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem auto' }}>
                <SearchFeature
                    refreshFunction={updateSearchTerms}
                 />
            </div>

            {Products.length === 0 ? 
                <div style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
                    <h2>No cars yet...</h2>
                </div> :
                <div>
                    <Row gutter={[16,16]}>
                        {renderCars}
                    </Row>

                </div>
            }
            <br/>
            <br/>

            {ProductsTotal >= Limit && 
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                <button onClick={onLoadMore}>Load More</button>
                </div>
            }

            
        </div>
    )
}

export default LandingPage
