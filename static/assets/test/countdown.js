var countdown = {
    template: '<span>' +
    '<template v-if="msTime.show">' +
    '<span v-if="tipShow">{{tipText}}</span><span v-if="!tipShow">{{tipTextEnd}}</span>' +
    '<span v-if="msTime.day>0">{{msTime.day}}</span>' +
    '<span v-if="msTime.hour>0">{{msTime.hour}}<small>:</small></span><span>{{msTime.minutes}}</span><small>:</small><span>{{msTime.seconds}}</span></template>' +
    '<p v-if="!msTime.show">{{endText}}</p>' +
    '<svg v-if="msTime.show" :class="{_red:alarmColorRed}" xmlns="http://www.w3.org/2000/svg" width="16" height="16">' +
    '<path d="M14.7 4.7C13.9 3.3 12.6 2.3 11.2 1.7 11.5 0.7 12.4 0 13.5 0 14.9 0 16 1.1 16 2.5 16 3.4 15.5 4.2 14.7 4.7ZM15 9C15 10.3 14.6 11.5 14 12.6L15.7 14.3 15.7 14.3C15.9 14.5 16' +
    ' 14.7 16 15 16 15.6 15.6 16 15 16 14.7 16 14.5 15.9 14.3 15.7L14.3 15.7 12.7 14.1C11.5 15.3 9.8 16 8 16 6.2 16 4.5 15.3 3.3 14.1L1.7 15.7 1.7 15.7C1.5 15.9 1.3 16 1 16 0.4 16 0 15.6 0 15 0 14.7 0.1 14.5 0.3 14.3L0.3 14.3 2 12.6C1.4 11.5 1 10.3 1 9 1 5.1 4.1 2 8 2 11.9 2 15 5.1 15 9ZM8 4C5.2 4 3 6.2 3 9 3 11.8 5.2 14 8 14 10.8 14 13 11.8 13 9 13 6.2 10.8 4 8 4ZM8.7 9.7L8.7 9.7 6.7 11.7 6.7 11.7C6.5 11.9 6.3 12 6 12 5.4 12 5 11.6 5 11 5 10.7 5.1 10.5 5.3 10.3L5.3 10.3 7 8.6 7 6C7 5.4 7.4 5 8 5 8.6 5 9 5.4 9 6L9 9C9 9.3 8.9 9.5 8.7 9.7ZM1.3 4.7C0.5 4.2 0 3.4 0 2.5 0 1.1 1.1 0 2.5 0 3.6 0 4.5 0.7 4.8 1.7 3.4 2.3 2.1 3.3 1.3 4.7Z"' +
    ':fill="alarmColor"></path></svg>' +
    '</span>',
    replace: true,
    data: function () {
        return {
            tipShow: true,
            msTime: {			//Countdown value
                show: false,		//Countdown state
                day: '',
                hour: '',
                minutes: '',
                seconds: ''
            },
            star: '',
            end: '',
            current: '',
        }
    },
    props: {
        //From the start prompt text
        tipText: {
            type: String,
            default: ''
        },
        //End of the prompt text
        tipTextEnd: {
            type: String,
            default: ''
        },
        //Time Control ID
        id: {
            type: String,
            default: '1'
        },
        duration: {
            type: Number,
            default: '0'
        },
        //current time
        currentTime: {
            type: Number
        },
        // Activity start time
        startTime: {
            type: Number
        },
        // 活动结束时间
        endTime: {
            type: Number
        },
        // Countdown End Displays the text
        endText: {
            type: String,
            default: 'over'
        },
        //Whether to open the stopwatch countdown, not completed
        secondsFixed: {
            type: Boolean,
            defaule: false
        }
    },
    computed: {
        alarmColor: function () {
            var duration = this.duration * 60 * 1000;
            var diff = (this.end - this.star) / duration * 100;

            if (diff < 20) {
                return '#ed2325';
            } else if (diff < 50) {
                return '#ffd940';
            } else {
                return '#40b336';
            }
        },
        alarmColorRed: function () {
            var duration = this.duration * 60 * 1000;
            var diff = (this.end - this.star) / duration * 100;

            if (diff < 20) {
                return true;
            }
        }
    },
    mounted: function () {
        //Judgment is seconds or milliseconds
        this.startTime.toString().length == 10 ? this.star = this.startTime * 1000 : this.star = this.startTime;
        this.endTime.toString().length == 10 ? this.end = this.endTime * 1000 : this.end = this.endTime;
        if (this.currentTime) {
            this.currentTime.toString().length == 10 ? this.current = this.currentTime * 1000 : this.current = this.currentTime;
        } else {
            this.current = ( new Date() ).getTime();
        }

        if (this.end < this.current) {
            /**
             * 结束时间小于当前时间 活动已结束
             */
            this.msTime.show = false;
            this.end_message();
        }
        else if (this.current < this.star) {
            /**
             * 当前时间小于开始时间 活动尚未开始
             */
            this.$set(this, 'tipShow', true);
            var self = this;
            setTimeout(function () {
                self.runTime(self.star, self.current, self.start_message);
            }, 1);
        }
        else if (this.end > this.current && this.star < this.current || this.star == this.current) {
            /**
             * 结束时间大于当前并且开始时间小于当前时间，执行活动开始倒计时
             */
            this.$set(this, 'tipShow', false);
            this.msTime.show = true;
            this.$emit('start_callback', this.msTime.show);
            var self = this;
            setTimeout(function () {
                self.runTime(self.end, self.star, self.end_message, true)
            }, 1);
        }
    },
    methods: {
        runTime: function (startTime, endTime, callFun, type) {
            var msTime = this.msTime;
            var timeDistance = startTime - endTime;
            if (timeDistance > 0) {
                this.msTime.show = true;
                msTime.day = Math.floor(timeDistance / 86400000);
                timeDistance -= msTime.day * 86400000;
                msTime.hour = Math.floor(timeDistance / 3600000);
                timeDistance -= msTime.hour * 3600000;
                msTime.minutes = Math.floor(timeDistance / 60000);
                timeDistance -= msTime.minutes * 60000;
                //是否开启秒表倒计,未完成
//                    this.secondsFixed ? msTime.seconds = new Number(timeDistance / 1000).toFixed(2) : msTime.seconds = Math.floor( timeDistance / 1000 ).toFixed(0);
                msTime.seconds = Math.floor(timeDistance / 1000).toFixed(0);
                timeDistance -= msTime.seconds * 1000;

                if (msTime.hour < 10) {
                    msTime.hour = "0" + msTime.hour;
                }
                if (msTime.minutes < 10) {
                    msTime.minutes = "0" + msTime.minutes;
                }
                if (msTime.seconds < 10) {
                    msTime.seconds = "0" + msTime.seconds;
                }
                var _s = Date.now();
                var _e = Date.now();
                var diffPerFunc = _e - _s;
                var self = this;
                setTimeout(function () {
                    if (type) {
                        self.runTime(self.end, endTime += 1000, callFun, true);
                    } else {
                        self.runTime(self.star, endTime += 1000, callFun);
                    }
                }, 1000 - diffPerFunc)
            }
            else {
                callFun();
            }
        },
        start_message: function () {
            this.$set(this, 'tipShow', false);
            this.$emit('start_callback', this.msTime.show);
            var self = this;
            setTimeout(function () {
                self.runTime(self.end, self.star, self.end_message, true)
            }, 1);
        },
        end_message: function () {
            this.msTime.show = false;
            this.$emit('end_callback', this.msTime.show);
        }
    }
};