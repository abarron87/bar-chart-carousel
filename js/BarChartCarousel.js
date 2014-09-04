/**
 * Created by abarron on 9/4/2014.
 */

/**
 * BarChartCarousel constructor.
 * @param config
 * @constructor
 */
function BarChartCarousel(config){
    this.charts = config.charts || 3;
    this.container = config.container || jQuery('body');
    this.chartHeight = config.chartHeight || 390;
    this.bottomOffset = config.bottomOffset || 40;
    this.init();
}

BarChartCarousel.prototype = {
    /**
     * init method. Called directly from the constructor.
     */
    init: function(){
        this.bars = this.container.find('.bars > div');
        this.setBarData();
        this.setInitialState();
        this.setupTimeline();
    },

    /**
     * setBarData
     * Cache the bar jQuery object along with an array of its heights.
     * Better than scraping the bar from DOM in each loop in setipTimeline.
     */
    setBarData: function(){
        var self = this;

        this.barData = [];
        this.bars.each(function(){
            var bar = jQuery(this);

            self.barData.push({
                bar: bar,
                heights: bar.data('heights').split(',')
            });
        });

        this.chartBackgrounds = this.container.data('backgrounds').split(',');
    },

    /**
     * setInitialState
     * Hide all but 1 pixel of each bar under the 'ground'.
     * Shift the absolutely positioned bars to sit next to each other.
     */
    setInitialState: function(){
        var left = 0,
            self = this;

        this.bars.each(function(){
            var bar = jQuery(this);

            bar.css({
                left: left,
                bottom: '-' + ((self.chartHeight + self.bottomOffset) - 1) + 'px'
            });
            left += 23; // 20px wide with 3px gap.
        });
    },

    /**
     * setupTimeline
     * Creation of the animation.
     * Iterates over the amount of charts and for each one adds the tween for every bar.
     * Adds a delay between each chart.
     */
    setupTimeline: function(){
        var self = this,
            backgroundSpans = this.bars.children('span');

        this.chartsTl = new TimelineLite();

        // Create a timeline for each chart.
        for(var i = 0; i < this.charts; i++){
            var chartTl = new TimelineLite();

            // Tween each bar.
            for(var j = 0, len = this.barData.length; j < len; j++){
                var barData = this.barData[j];

                // Create closure to ensure loop local variable values are preserved at runtime.
                (function(barData, backgrounds, i, j) {
                    var bar = barData.bar,
                        height = barData.heights[i],
                        background = backgrounds[i],
                        bgSpan = bar.children('span');

                    chartTl.add(
                        TweenLite.to(
                            bar,
                            0.8,
                            {
                                bottom: (-(self.chartHeight + self.bottomOffset)) + parseInt(height, 10),
                                ease: Back.easeOut,
                                onStart: function () {
                                    // Alter background position depending on visible height (CSS 'bottom').
                                    bgSpan.css('backgroundPosition', '-' + (j * 23) + 'px -' + (self.chartHeight - height) + 'px');
                                }
                            }
                        ),
                        '-=0.7'
                    );

                    // Set span to transparent to allow fading in of new background.
                    //
                    chartTl.set(
                        bgSpan,
                        {
                            'opacity': '0',
                            'background-image': 'url(' + background + ')'
                        },
                        '-=0.7'
                    );

                    // Fade in span with new background.
                    chartTl.add(
                        TweenLite.to(
                            bgSpan,
                            0.5,
                            { opacity: 1 }
                        ),
                        '-=0.5'
                    );
                })(barData, self.chartBackgrounds, i, j);
            }

            //Add timeline (chart) to main timeline. Delay it until 3 seconds after the previous chart has finished loading.
            this.chartsTl.add(chartTl, '+=' + ((i > 0) ? 3 : 0));
        }
    }
};
