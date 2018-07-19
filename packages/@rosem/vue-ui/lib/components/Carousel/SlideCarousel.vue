<template>
    <rosem-carousel :range="6">
        <div class="carousel" slot-scope="carouselProps">
            <h4>{{ carouselProps.currentSlideIndex }}</h4>
            <transition-group tag="ul"
                              :name="`slide-${carouselProps.currentSlideIndex - carouselProps.previousSlideIndex > 0 ? 'next' : 'previous'}`"
                              @enter-cancelled="enterCancelled"
                              @leave-cancelled="leaveCancelled"
            >
                <li v-for="(slide, index) in slides"
                    v-show="index === carouselProps.currentSlideIndex"
                    :key="index"
                >
                    <figure>
                        <img :src="slide.imgSrc">
                        <figcaption :style="{color: slide.titleColor}">{{ slide.title }}</figcaption>
                    </figure>
                </li>
            </transition-group>
            <div class="navigation">
                <span v-on="carouselProps.previousHandlers"><svg><use xlink:href="/images/arrows.svg#left"/></svg></span>
                <span v-on="carouselProps.nextHandlers"><svg><use xlink:href="/images/arrows.svg#right"/></svg></span>
            </div>
            <div class="pagination">
                <div v-for="(slide, index) in slides"
                     :key="index"
                     :class="{active: index === carouselProps.currentSlideIndex}"
                ></div>
            </div>
        </div>
    </rosem-carousel>
</template>

<script>
export default {};
</script>
