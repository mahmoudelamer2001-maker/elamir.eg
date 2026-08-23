"use strict";

/* =========================================================
   الامير | متجر الملابس
   COMPLETE STORE SYSTEM
   Cart + Products + Images + Options + Search + WhatsApp
========================================================= */


/* =========================================================
   إعدادات المتجر
========================================================= */

const STORE_CONFIG = {
    cartKey: "alharithyCart",
    whatsapp: "201015495165",
    homePage: "index.html"
};


/* =========================================================
   بيانات المنتجات
========================================================= */

const productsData = {

    1: {
        name: "تيشيرت اوفر سايز ESETE",
        price: 250,

        images: [
            "images/me/photo_1_2026-08-23_13-13-40.jpg",
            "images/me/photo_1_2026-08-23_21-35-51 copy.jpg",
            "images/me/photo_2_2026-08-23_21-35-51.jpg",
            "images/me/photo_3_2026-08-23_21-35-51.jpg"
        ],

        colors: [
            {
                name: "أسود",
                value: "#000000"
            },
            {
                name: "رمادي",
                value: "#838383"
            },
            {
                name: "برجاندي",
                value: "#8b0000"
            },
            {
                name: "زيتي",
                value: "#01580d"
            }
        ],

        sizes: [
            "M",
            "L",
            "XL"
        ]
    },


    2: {
        name: "هودي أبيض",
        price: 1199,

        images: [
            "images/photo_2026-07-31_06-25-46.jpg"
        ],

        colors: [
            {
                name: "أبيض",
                value: "#ffffff"
            },
            {
                name: "أسود",
                value: "#000000"
            }
        ],

        sizes: [
            "L",
            "XL",
            "XXL"
        ]
    },


    3: {
        name: "بنطلون جينز",
        price: 999,

        images: [
            "images/photo_2026-07-31_06-25-46.jpg"
        ],

        colors: [
            {
                name: "أزرق",
                value: "#183b63"
            },
            {
                name: "أسود",
                value: "#111111"
            }
        ],

        sizes: [
            "30",
            "32",
            "34",
            "36",
            "38"
        ]
    },


    4: {
        name: "جاكيت شتوي",
        price: 1699,

        images: [
            "images/photo_2026-07-31_06-25-46.jpg"
        ],

        colors: [
            {
                name: "أسود",
                value: "#000000"
            },
            {
                name: "بني",
                value: "#5a3825"
            }
        ],

        sizes: [
            "M",
            "L",
            "XL",
            "XXL"
        ]
    },


    5: {
        name: "قميص كلاسيك",
        price: 849,

        images: [
            "images/اسود.jpg",
            "images/صورة-2.png",
            "images/صورة-3.png"
        ],

        colors: [
            {
                name: "أبيض",
                value: "#ffffff"
            },
            {
                name: "أسود",
                value: "#111111"
            }
        ],

        sizes: [
            "S",
            "M",
            "L",
            "XL"
        ]
    },


    6: {
        name: "سويت شيرت",
        price: 949,

        images: [
            "images/photo_2026-07-31_06-25-46.jpg"
        ],

        colors: [
            {
                name: "أسود",
                value: "#000000"
            },
            {
                name: "رمادي",
                value: "#777777"
            }
        ],

        sizes: [
            "M",
            "L",
            "XL",
            "XXL"
        ]
    }

};


/* =========================================================
   أدوات مساعدة
========================================================= */

const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};


const $$ = (selector, parent = document) => {
    return [...parent.querySelectorAll(selector)];
};


function formatPrice(price) {

    return Number(price || 0).toLocaleString("ar-EG");

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   الحصول على أول صورة للمنتج
========================================================= */

function getProductImage(product) {

    if (!product) {
        return "";
    }

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {
        return product.images[0];
    }

    if (product.image) {
        return product.image;
    }

    return "";

}


/* =========================================================
   الحصول على صور المنتج
========================================================= */

function getProductImages(product) {

    if (!product) {
        return [];
    }

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {
        return product.images;
    }

    if (product.image) {
        return [product.image];
    }

    return [];

}


/* =========================================================
   نظام السلة
========================================================= */

function getCart() {

    try {

        const savedCart =
            localStorage.getItem(
                STORE_CONFIG.cartKey
            );

        if (!savedCart) {
            return [];
        }

        const parsed =
            JSON.parse(savedCart);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.map(item => ({

            ...item,

            quantity:
                Math.max(
                    1,
                    Number(item.quantity) || 1
                ),

            price:
                Number(item.price) || 0,

            image:
                item.image || ""

        }));

    } catch (error) {

        console.error(
            "خطأ في قراءة السلة:",
            error
        );

        return [];

    }

}


/* =========================================================
   حفظ السلة
========================================================= */

function saveCart(cart) {

    try {

        localStorage.setItem(
            STORE_CONFIG.cartKey,
            JSON.stringify(cart)
        );

        updateGlobalCartUI(cart);

        window.dispatchEvent(
            new CustomEvent(
                "cartUpdated",
                {
                    detail: cart
                }
            )
        );

    } catch (error) {

        console.error(
            "خطأ في حفظ السلة:",
            error
        );

    }

}


/* =========================================================
   إنشاء ID للسلة
========================================================= */

function createCartId(
    productId,
    color = "",
    size = ""
) {

    return [
        String(productId),
        String(color || "default"),
        String(size || "default")
    ].join("-");

}


/* =========================================================
   حساب كمية المنتجات
========================================================= */

function getCartQuantity(cart) {

    return cart.reduce(
        (total, item) => {

            return total +
                (Number(item.quantity) || 0);

        },
        0
    );

}


/* =========================================================
   حساب السعر
========================================================= */

function getCartTotal(cart) {

    return cart.reduce(
        (total, item) => {

            return total +
                (
                    Number(item.price) || 0
                ) *
                (
                    Number(item.quantity) || 0
                );

        },
        0
    );

}


/* =========================================================
   عداد السلة
========================================================= */

function updateCartCounter(
    cart = getCart()
) {

    const count =
        $("#count");

    if (!count) {
        return;
    }

    count.textContent =
        getCartQuantity(cart);

    count.style.display =
        "flex";

}


/* =========================================================
   تحديث معلومات السلة
========================================================= */

function updateGlobalCartUI(
    cart = getCart()
) {

    updateCartCounter(cart);

    const total =
        $("#total-price");

    if (total) {

        total.textContent =
            formatPrice(
                getCartTotal(cart)
            );

    }

}


/* =========================================================
   إضافة منتج للسلة
========================================================= */

function addToCart({

    productId,
    color = "",
    size = "",
    quantity = 1

}) {

    const product =
        productsData[String(productId)];

    if (!product) {

        console.error(
            "المنتج غير موجود:",
            productId
        );

        showMessage(
            "حدث خطأ: المنتج غير موجود."
        );

        return false;

    }


    const cart =
        getCart();


    const safeQuantity =
        Math.max(
            1,
            Number(quantity) || 1
        );


    const cartId =
        createCartId(
            productId,
            color,
            size
        );


    const existingItem =
        cart.find(
            item =>
                item.cartId === cartId
        );


    if (existingItem) {

        existingItem.quantity +=
            safeQuantity;

    } else {

        cart.push({

            id:
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 9)}`,

            cartId,

            productId:
                String(productId),

            name:
                product.name,

            price:
                Number(product.price) || 0,

            image:
                getProductImage(product),

            color:
                color || "",

            size:
                size || "",

            quantity:
                safeQuantity

        });

    }


    saveCart(cart);

    return true;

}


/* =========================================================
   حذف منتج
========================================================= */

function removeFromCart(cartId) {

    let cart =
        getCart();

    cart =
        cart.filter(
            item =>
                item.cartId !== cartId
        );

    saveCart(cart);

}


/* =========================================================
   تغيير الكمية
========================================================= */

function changeCartQuantity(
    cartId,
    change
) {

    const cart =
        getCart();

    const item =
        cart.find(
            product =>
                product.cartId === cartId
        );

    if (!item) {
        return;
    }


    item.quantity =
        Number(item.quantity) +
        Number(change);


    if (item.quantity <= 0) {

        removeFromCart(cartId);

        return;

    }


    saveCart(cart);

}


/* =========================================================
   عرض السلة
========================================================= */

function renderCart() {

    const cartItems =
        $("#cart-items");

    const cart =
        getCart();


    updateGlobalCartUI(cart);


    if (!cartItems) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <p>
                    السلة فارغة 🛍️
                </p>

                <span>
                    أضف بعض المنتجات للبدء
                </span>

            </div>

        `;

        return;

    }


    cartItems.innerHTML =
        cart.map(item => {

            const image =
                item.image || "";

            return `

                <div
                    class="cart-item"
                    data-cart-id="${escapeHTML(
                        item.cartId
                    )}"
                >

                    <div class="cart-product">

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(item.name)}"
                                        loading="lazy"
                                        onerror="this.style.display='none'"
                                    >
                                `
                                : ""
                        }

                        <div>

                            <h3>
                                ${escapeHTML(item.name)}
                            </h3>

                            <p>
                                ${formatPrice(item.price)}
                                جنيه
                            </p>

                            ${
                                item.color
                                    ? `
                                        <small>
                                            اللون:
                                            ${escapeHTML(item.color)}
                                        </small>
                                    `
                                    : ""
                            }

                            ${
                                item.size
                                    ? `
                                        <small>
                                            المقاس:
                                            ${escapeHTML(item.size)}
                                        </small>
                                    `
                                    : ""
                            }

                        </div>

                    </div>


                    <div class="cart-controls">

                        <button
                            type="button"
                            class="quantity-btn"
                            data-action="decrease"
                            data-cart-id="${escapeHTML(
                                item.cartId
                            )}"
                        >
                            −
                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            type="button"
                            class="quantity-btn"
                            data-action="increase"
                            data-cart-id="${escapeHTML(
                                item.cartId
                            )}"
                        >
                            +
                        </button>


                        <button
                            type="button"
                            class="remove-btn"
                            data-action="remove"
                            data-cart-id="${escapeHTML(
                                item.cartId
                            )}"
                        >
                            🗑
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   أحداث السلة
========================================================= */

function initializeCart() {

    const cartItems =
        $("#cart-items");


    cartItems?.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );

            if (!button) {
                return;
            }


            const action =
                button.dataset.action;

            const cartId =
                button.dataset.cartId;


            if (!action || !cartId) {
                return;
            }


            if (
                action === "increase"
            ) {

                changeCartQuantity(
                    cartId,
                    1
                );

            }


            if (
                action === "decrease"
            ) {

                changeCartQuantity(
                    cartId,
                    -1
                );

            }


            if (
                action === "remove"
            ) {

                removeFromCart(
                    cartId
                );

            }


            renderCart();

        }
    );


    const cartIcon =
        $("#cartIcon");


    cartIcon?.addEventListener(
        "click",
        () => {

            renderCart();

            const cartSection =
                $(".cart-section");

            if (!cartSection) {
                return;
            }

            cartSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );


    window.addEventListener(
        "cartUpdated",
        () => {

            renderCart();

        }
    );


    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                STORE_CONFIG.cartKey
            ) {

                renderCart();

            }

        }
    );


    renderCart();

}


/* =========================================================
   أزرار أضف إلى السلة
========================================================= */

function initializeProductButtons() {

    $$(".add-product-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    const productId =
                        button.dataset.product;


                    if (
                        !productId ||
                        !productsData[productId]
                    ) {

                        showMessage(
                            "المنتج غير موجود."
                        );

                        return;

                    }


                    openProductOptions(
                        productId
                    );

                }
            );

        });

}


/* =========================================================
   نافذة اختيار المنتج
========================================================= */

function openProductOptions(
    productId
) {

    const product =
        productsData[String(productId)];

    if (!product) {
        return;
    }


    document
        .querySelector(
            ".product-options-modal"
        )
        ?.remove();


    let selectedColor =
        product.colors?.[0]?.name || "";


    let selectedSize =
        "";


    const images =
        getProductImages(product);


    const modal =
        document.createElement("div");


    modal.className =
        "product-options-modal";


    modal.innerHTML = `

        <div class="product-options-box">

            <button
                type="button"
                class="product-options-close"
            >
                ×
            </button>


            <div class="product-options-image">

                <img
                    src="${escapeHTML(
                        images[0] || ""
                    )}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                >

            </div>


            <div class="product-options-content">

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>


                <p class="product-options-price">

                    ${formatPrice(
                        product.price
                    )}

                    جنيه

                </p>


                <div class="option-group">

                    <div class="option-title">
                        اختر اللون
                    </div>


                    <div class="modal-color-options">

                        ${
                            product.colors?.map(
                                (color, index) => {

                                    return `

                                        <button
                                            type="button"
                                            class="modal-color-option ${
                                                index === 0
                                                    ? "active"
                                                    : ""
                                            }"
                                            data-color="${escapeHTML(
                                                color.name
                                            )}"
                                        >

                                            <span
                                                style="
                                                    background:${escapeHTML(
                                                        color.value
                                                    )};
                                                "
                                            ></span>

                                            ${escapeHTML(
                                                color.name
                                            )}

                                        </button>

                                    `;

                                }
                            ).join("") || ""
                        }

                    </div>

                </div>


                <div class="option-group">

                    <div class="option-title">
                        اختر المقاس
                    </div>


                    <div class="modal-size-options">

                        ${
                            product.sizes?.map(
                                size => {

                                    return `

                                        <button
                                            type="button"
                                            class="modal-size-option"
                                            data-size="${escapeHTML(
                                                size
                                            )}"
                                        >

                                            ${escapeHTML(
                                                size
                                            )}

                                        </button>

                                    `;

                                }
                            ).join("") || ""
                        }

                    </div>

                </div>


                <button
                    type="button"
                    class="modal-add-to-cart"
                >

                    <i class="fa-solid fa-cart-plus"></i>

                    إضافة إلى السلة

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        $(".product-options-close", modal);


    const addButton =
        $(".modal-add-to-cart", modal);


    const colorButtons =
        $$(".modal-color-option", modal);


    const sizeButtons =
        $$(".modal-size-option", modal);


    /* اللون */

    colorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    colorButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedColor =
                        button.dataset.color || "";

                }
            );

        }
    );


    /* المقاس */

    sizeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    sizeButtons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedSize =
                        button.dataset.size || "";

                }
            );

        }
    );


    /* إغلاق */

    function closeModal() {

        modal.classList.remove(
            "show"
        );

        setTimeout(
            () => modal.remove(),
            200
        );

    }


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );


    /* إضافة */

    addButton?.addEventListener(
        "click",
        () => {

            if (!selectedColor) {

                showMessage(
                    "من فضلك اختر اللون أولًا 🎨"
                );

                return;

            }


            if (!selectedSize) {

                showMessage(
                    "من فضلك اختر المقاس أولًا 👕"
                );

                return;

            }


            const success =
                addToCart({

                    productId,

                    color:
                        selectedColor,

                    size:
                        selectedSize,

                    quantity: 1

                });


            if (!success) {
                return;
            }


            addButton.innerHTML = `

                <i class="fa-solid fa-check"></i>

                تمت الإضافة للسلة

            `;


            addButton.disabled =
                true;


            setTimeout(
                closeModal,
                700
            );

        }
    );


    requestAnimationFrame(
        () => {

            modal.classList.add(
                "show"
            );

        }
    );


    function escapeHandler(
        event
    ) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

        }

    }


    document.addEventListener(
        "keydown",
        escapeHandler
    );

}


/* =========================================================
   تبديل صور المنتجات بالماوس
========================================================= */

function initializeProductImageHover() {

    $$(".product-card")
        .forEach(card => {

            const productId =
                card.dataset.product;


            const product =
                productsData[
                    String(productId)
                ];


            const image =
                $("img", card);


            if (
                !product ||
                !image
            ) {
                return;
            }


            const images =
                getProductImages(product);


            if (images.length <= 1) {
                return;
            }


            let currentIndex =
                0;

            let interval =
                null;


            function changeImage(
                index
            ) {

                if (!images[index]) {
                    return;
                }


                image.style.opacity =
                    "0";


                setTimeout(
                    () => {

                        image.src =
                            images[index];

                        image.style.opacity =
                            "1";

                    },
                    120
                );

            }


            card.addEventListener(
                "mouseenter",
                () => {

                    currentIndex =
                        0;


                    changeImage(
                        currentIndex
                    );


                    clearInterval(
                        interval
                    );


                    interval =
                        setInterval(
                            () => {

                                currentIndex++;

                                if (
                                    currentIndex >=
                                    images.length
                                ) {

                                    currentIndex =
                                        0;

                                }


                                changeImage(
                                    currentIndex
                                );

                            },
                            1200
                        );

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    clearInterval(
                        interval
                    );


                    interval =
                        null;


                    currentIndex =
                        0;


                    changeImage(
                        0
                    );

                }
            );

        });

}


/* =========================================================
   زر تسوق الآن
========================================================= */

function initializeShopButton() {

    const shopButton =
        $("#shopBtn");


    if (!shopButton) {
        return;
    }


    shopButton.addEventListener(
        "click",
        event => {

            event.preventDefault();


            $("#products")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );

}


/* =========================================================
   البحث
========================================================= */

function initializeSearch() {

    const searchIcon =
        $("#searchIcon");


    if (!searchIcon) {
        return;
    }


    searchIcon.addEventListener(
        "click",
        openSearch
    );


    searchIcon.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openSearch();

            }

        }
    );


    function openSearch() {

        const existing =
            $(".search-box");


        if (existing) {

            $("#searchInput", existing)
                ?.focus();

            return;

        }


        const searchBox =
            document.createElement(
                "div"
            );


        searchBox.className =
            "search-box";


        searchBox.innerHTML = `

            <div
                class="search-inner"
                role="dialog"
                aria-modal="true"
            >

                <input
                    id="searchInput"
                    type="search"
                    placeholder="ابحث عن منتج..."
                    autocomplete="off"
                >

                <button
                    id="closeSearch"
                    type="button"
                >
                    ✕
                </button>

            </div>

        `;


        document.body.appendChild(
            searchBox
        );


        const input =
            $("#searchInput", searchBox);


        const closeButton =
            $("#closeSearch", searchBox);


        input?.focus();


        input?.addEventListener(
            "input",
            () => {

                const value =
                    input.value
                        .trim()
                        .toLowerCase();


                $$(".product-card")
                    .forEach(card => {

                        const name =
                            $("h3", card)
                                ?.textContent
                                .trim()
                                .toLowerCase() || "";


                        card.style.display =
                            !value ||
                            name.includes(value)
                                ? ""
                                : "none";

                    });

            }
        );


        function closeSearch() {

            $$(".product-card")
                .forEach(
                    card => {
                        card.style.display =
                            "";
                    }
                );


            searchBox.remove();


            document.removeEventListener(
                "keydown",
                escapeHandler
            );

        }


        function escapeHandler(
            event
        ) {

            if (
                event.key === "Escape"
            ) {

                closeSearch();

            }

        }


        closeButton?.addEventListener(
            "click",
            closeSearch
        );


        searchBox.addEventListener(
            "click",
            event => {

                if (
                    event.target === searchBox
                ) {

                    closeSearch();

                }

            }
        );


        document.addEventListener(
            "keydown",
            escapeHandler
        );

    }

}


/* =========================================================
   صفحة تفاصيل المنتج
========================================================= */

function initializeProductPage() {

    const productImage =
        $("#productImage");


    const productName =
        $("#productName");


    const productPrice =
        $("#productPrice");


    const colorOptions =
        $("#colorOptions");


    const selectedColor =
        $("#selectedColor");


    const selectedSize =
        $("#selectedSize");


    const quantityElement =
        $("#quantity");


    const increaseBtn =
        $("#increaseBtn");


    const decreaseBtn =
        $("#decreaseBtn");


    const addProductBtn =
        $("#addProductBtn");


    if (
        !productImage ||
        !productName ||
        !productPrice ||
        !addProductBtn
    ) {

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("product");


    const product =
        productsData[
            String(productId)
        ];


    if (!product) {

        productName.textContent =
            "المنتج غير موجود";


        productPrice.textContent =
            "";


        addProductBtn.disabled =
            true;


        return;

    }


    /* =====================================================
       الصور
    ===================================================== */

    const images =
        getProductImages(product);


    productImage.src =
        images[0] || "";


    productImage.alt =
        product.name;


    /* =====================================================
       الاسم والسعر
    ===================================================== */

    productName.textContent =
        product.name;


    productPrice.textContent =
        `${formatPrice(
            product.price
        )} جنيه`;


    /* =====================================================
       ألوان المنتج
    ===================================================== */

    let selectedColorValue =
        product.colors?.[0]?.name || "";


    if (
        colorOptions &&
        Array.isArray(product.colors)
    ) {

        colorOptions.innerHTML =
            "";


        product.colors.forEach(
            (color, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "color-option";


                button.style.backgroundColor =
                    color.value;


                button.title =
                    color.name;


                button.setAttribute(
                    "aria-label",
                    `اختيار اللون ${color.name}`
                );


                if (index === 0) {

                    button.classList.add(
                        "active"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        $$(".color-option")
                            .forEach(
                                btn =>
                                    btn.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        selectedColorValue =
                            color.name;


                        if (selectedColor) {

                            selectedColor.textContent =
                                `اللون المختار: ${color.name}`;

                        }

                    }
                );


                colorOptions.appendChild(
                    button
                );

            }
        );


        if (selectedColor) {

            selectedColor.textContent =
                `اللون المختار: ${selectedColorValue}`;

        }

    }


    /* =====================================================
       المقاسات
    ===================================================== */

    let selectedSizeValue =
        "";


    const sizeButtons =
        $$(".size-options button");


    sizeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    sizeButtons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    selectedSizeValue =
                        button.dataset.size ||
                        button.textContent.trim();


                    if (selectedSize) {

                        selectedSize.textContent =
                            `المقاس المختار: ${selectedSizeValue}`;

                    }

                }
            );

        }
    );


    /* =====================================================
       الكمية
    ===================================================== */

    let quantity =
        1;


    function updateQuantity() {

        if (quantityElement) {

            quantityElement.textContent =
                quantity;

        }

    }


    increaseBtn?.addEventListener(
        "click",
        () => {

            quantity++;

            updateQuantity();

        }
    );


    decreaseBtn?.addEventListener(
        "click",
        () => {

            if (
                quantity <= 1
            ) {
                return;
            }


            quantity--;

            updateQuantity();

        }
    );


    updateQuantity();


    /* =====================================================
       إضافة المنتج
    ===================================================== */

    addProductBtn.addEventListener(
        "click",
        () => {

            if (!selectedColorValue) {

                showMessage(
                    "من فضلك اختر اللون أولًا 🎨"
                );

                return;

            }


            if (!selectedSizeValue) {

                showMessage(
                    "من فضلك اختر المقاس أولًا 👕"
                );

                return;

            }


            const success =
                addToCart({

                    productId,

                    color:
                        selectedColorValue,

                    size:
                        selectedSizeValue,

                    quantity

                });


            if (!success) {
                return;
            }


            addProductBtn.disabled =
                true;


            addProductBtn.innerHTML = `

                <i class="fa-solid fa-check"></i>

                تمت الإضافة للسلة

            `;


            setTimeout(
                () => {

                    window.location.href =
                        `${STORE_CONFIG.homePage}#products`;

                },
                700
            );

        }
    );

}


/* =========================================================
   واتساب
========================================================= */

function initializeCheckout() {

    const checkoutButton =
        $("#checkoutWhatsapp");


    if (!checkoutButton) {
        return;
    }


    checkoutButton.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const cart =
                getCart();


            if (!cart.length) {

                showMessage(
                    "السلة فارغة، أضف منتجًا أولًا 🛍️"
                );

                return;

            }


            let message =
                "مرحبًا، أريد طلب المنتجات التالية من متجر الامير:\n\n";


            cart.forEach(
                (item, index) => {

                    const itemTotal =
                        Number(item.price) *
                        Number(item.quantity);


                    message +=
                        `${index + 1}- ${item.name}\n`;


                    message +=
                        `الكمية: ${item.quantity}\n`;


                    message +=
                        `السعر: ${formatPrice(
                            item.price
                        )} جنيه\n`;


                    message +=
                        `إجمالي المنتج: ${formatPrice(
                            itemTotal
                        )} جنيه\n`;


                    if (item.color) {

                        message +=
                            `اللون: ${item.color}\n`;

                    }


                    if (item.size) {

                        message +=
                            `المقاس: ${item.size}\n`;

                    }


                    message +=
                        "\n";

                }
            );


            const total =
                getCartTotal(cart);


            message +=
                `الإجمالي النهائي: ${formatPrice(
                    total
                )} جنيه\n\n`;


            message +=
                "أريد إتمام الطلب.";


            const whatsappURL =
                `https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent(
                    message
                )}`;


            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );

}


/* =========================================================
   الرسائل
========================================================= */

function showMessage(
    message
) {

    alert(message);

}


/* =========================================================
   تشغيل الموقع
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeShopButton();

        initializeProductButtons();

        initializeCart();

        initializeSearch();

        initializeProductPage();

        initializeCheckout();

        initializeProductImageHover();

        updateGlobalCartUI();

    }
);


/* =========================================================
   إتاحة الدوال
========================================================= */

window.productsData =
    productsData;


window.getCart =
    getCart;


window.saveCart =
    saveCart;


window.addToCart =
    addToCart;


window.removeFromCart =
    removeFromCart;


window.changeCartQuantity =
    changeCartQuantity;


window.renderCart =
    renderCart;