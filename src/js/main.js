import "../scss/main.scss";
import "../font/firasans.css";
import {
    initMap,
    geocoder,
    createPlacemark,
    createTempPlacemark,
    destroyTempPlacemark
} from "./modules/yandex";
import config from "./modules/config.json";
import templateReview from "../views/review.hbs";
import templateReviewForm from "../views/reviewForm.hbs";

(async function () {
    var { map, clusterer, openReviewBalloon } = await initMap("map", config.map);

    loadStorage();
    map.events.add("click", async function (e) {
        e.preventDefault();
        reviewForm.destroy();
        var coords = e.get("coords");
        var address = await geocoder(coords);

        var placemark = createTempPlacemark(coords, {
            hintContent: address
        });

        reviewForm.setAddress(address, coords);
        reviewForm.show();
        map.setCenter(coords, map.getZoom() >= 15 ? map.getZoom() : 15, {
            duration: 500
        });

        placemark.events.add("click", function (e) {
            e.preventDefault();
            reviewForm.setAddress(address, coords);
            reviewForm.show();
            map.setCenter(coords, map.getZoom() >= 15 ? map.getZoom() : 15, {
                duration: 500
            });
        });
    });
})();

let reviewForm = {
    _reviews: [
        /*     {
                    address: "",
                    coords: [],
                    reviews: [
                        {
                            name: "",
                            place: "",
                            date: "",
                            text: ""
                        }
                    ]
                } */
    ],
    address: "",
    coords: [],
    get: function () {
        return document.body.querySelector(".review_form");
    },
    setAddress: function (address, coords) {
        console.log(address, coords);
        reviewForm.address = address;
        reviewForm.coords = coords;
        reviewForm.get().querySelector(".h_address").innerHTML = address;
        reviewForm.updateReviews();
    },
    destroy: function () {
        reviewForm.get().querySelector(".r_scroll").innerHTML = "";
        reviewForm.address = "";
        reviewForm.coords = [];
        reviewForm.reviewClearinputs();
        destroyTempPlacemark();
    },
    show: function () {
        let form = reviewForm.get();
        if (form !== null && form.classList.contains("hide")) {
            form.classList.remove("hide");
        }
    },
    hide: function () {
        let form = reviewForm.get();
        if (form !== null && !form.classList.contains("hide")) {
            form.classList.add("hide");
        }
    },
    updateReviews: function() {
        reviewForm.get().querySelector(".r_scroll").innerHTML = "";
        let index = reviewForm._reviews.findIndex(
            review => review.address === reviewForm.address
        );
        if (index !== -1) {
            reviewForm._reviews[index].reviews.forEach(function (review) {
                reviewForm
                    .get()
                    .querySelector(".r_scroll").innerHTML += templateReviewForm({
                        name: review.name,
                        place: review.place,
                        date: review.date,
                        text: review.text
                    });
            });
        } else {
            reviewForm.get().querySelector(".r_scroll").innerHTML =
                '<div class="no_reviews">Будь первым! Оставь свой отзыв.</div>';
        }
    },
    getAddress: function (coords) {
        let index = reviewForm._reviews.findIndex(
            review => review.coords === coords
        );
        if (index !== -1) {
            return reviewForm._reviews[index].address;
        }

        return "";
    },
    reviewClearinputs: function() {
        reviewForm.get().querySelector("input.input_name").value = "";
        reviewForm.get().querySelector("input.input_place").value = "";
        reviewForm.get().querySelector("textarea.input_review").value = "";
    },
    addReview: function () {
        let name = reviewForm.get().querySelector("input.input_name").value;
        let place = reviewForm.get().querySelector("input.input_place").value;
        let text = reviewForm.get().querySelector("textarea.input_review").value;

        if (name === '' || place === '' || text === '') {
            if (reviewForm.get().querySelector('span.red_text').classList.contains('hide')) {
                reviewForm.get().querySelector('span.red_text').classList.remove('hide');
            }

            return;
        } else {
            if (!reviewForm.get().querySelector('span.red_text').classList.contains('hide')) {
                reviewForm.get().querySelector('span.red_text').classList.add('hide');
            }
        }

        reviewForm.reviewClearinputs();

        try {
            let index = reviewForm._reviews.findIndex(
                review => review.address === reviewForm.address
            );
            var d = new Date();
            if (index !== -1) {
                reviewForm._reviews[index].reviews = [
                    ...reviewForm._reviews[index].reviews,
                    {
                        name,
                        place,
                        date: d.toLocaleDateString(),
                        text
                    }
                ];
            } else {
                reviewForm._reviews = [
                    ...reviewForm._reviews,
                    {
                        address: reviewForm.address,
                        coords: reviewForm.coords,
                        reviews: [
                            {
                                name,
                                place,
                                date: d.toLocaleDateString(),
                                text
                            }
                        ]
                    }
                ];
            }
        } catch (error) {
            console.log(error);
        }
        localStorage.setItem("reviews_geo", JSON.stringify(reviewForm._reviews));
        destroyTempPlacemark();

        var placemark = createPlacemark(reviewForm.coords, {
            hintContent: reviewForm.address,
            balloonContent: templateReview({
                place: place,
                address: reviewForm.address,
                text: text,
                date: d.toLocaleDateString()
            })
        });

        console.log(placemark.events);

        placemark.events.add("click", function (e) {
            try {
                e.preventDefault();
                geocoder(e.get("coords")).then(function (res) {
                    destroyTempPlacemark();
                    reviewForm.setAddress(res, e.get("coords"));
                    reviewForm.updateReviews();
                    reviewForm.show();
                });
            } catch (error) {
                console.log(error);
            }
        });

        reviewForm.updateReviews();
    }
};

window.balloonLink = function(address) {
    reviewForm.setAddress(address);
    reviewForm.updateReviews();
    reviewForm.show();
}

function loadStorage() {
    let reviews = localStorage.getItem("reviews_geo") || "[]";
    reviewForm._reviews = JSON.parse(reviews);
    if (reviewForm._reviews.length === 0) {
        return;
    }
    reviewForm._reviews.forEach(function (item) {
        item.reviews.forEach(function (review) {
            let address = item.address;
            let coords = item.coords;
            let place = review.place;
            let text = review.text;
            let date = review.date;

            var placemark = createPlacemark(coords, {
                hintContent: address,
                balloonContent: templateReview({
                    place: place,
                    address: address,
                    text: text,
                    date: date
                })
            });

            placemark.events.add("click", function (e) {
                try {
                    e.preventDefault();
                    geocoder(e.get("coords")).then(function (res) {
                        destroyTempPlacemark();
                        reviewForm.setAddress(res, e.get("coords"));
                        reviewForm.updateReviews();
                        reviewForm.show();
                    });
                } catch (error) {
                    console.log(error);
                }
            });
        });
    });
}

reviewForm
    .get()
    .querySelector("div.h_close")
    .addEventListener("click", e => {
        reviewForm.hide();
        reviewForm.destroy();
    });

reviewForm
    .get()
    .querySelector("button.btn_add")
    .addEventListener("click", e => {
        reviewForm.addReview();
    });
