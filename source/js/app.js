import Vue from 'vue/dist/vue.js';
import { mapState, mapGetters, mapMutations } from 'vuex';

import store from './store';

import Paging from './components/pagination';
// import './components/chart';
import Coin from './components/coin';
// import './components/detail';
// import './components/watchlist';
import Loader from './components/loader';

const app = new Vue({
	el: '.js-app',
	store,

	components: {
		'component-coin': Coin,
		'component-loader': Loader,
		'component-pagination': Paging,
	},

	mounted() {
		this.$store.dispatch('getData');
	},

	// map 'store.state.xx' to 'this.xx'
	computed: Object.assign(
		mapState([
			'coins',
			'currentPage',
			'perPage',
			'watchlist',
		]),
		mapGetters([
			'coinsOnPage',
			'totalPages',
		]),
		{
			// https://vuex.vuejs.org/en/forms.html
			perPage: {
				get() {
					return this.$store.state.perPage;
				},
				set(value) {
					this.$store.commit('perPage', value);
				},
			},
		}
	),

	watch: {
		search() {
			this.$store.commit('page', 0);
		},

		perPage() {
			this.$store.commit('page', 0);
		},
	},

	methods: {
		onTrade(trade) {
			const coin = this.coins.find(c => c.short === trade.msg.short);

			if (!coin) {
				return;
			}

			const direction = trade.msg.price > coin.price ? 1 : -1;

			Object.assign(coin, trade.msg, { tickDirection: direction });

			this.updateWatchlist(trade.msg);
		},

		onSubmitForm(e) {
			e.preventDefault();

			const { watchlistForm } = this;
			const coin = this.coins.find(c => c.short === watchlistForm.coin);

			watchlistForm.amount = Number((watchlistForm.investment / coin.price).toFixed(8)); // eslint-disable-line max-len
			watchlistForm.pricePurchase = coin.price;

			const data = Object.assign({}, coin, watchlistForm);

			this.watchlist.push(data);

			localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
		},

		getWatchlistData() {
			const watchlist = JSON.parse(localStorage.getItem('watchlist'));

			if (watchlist) {
				this.watchlist = watchlist;
			}
		},

		updateWatchlist(trade) {
			const coinsInWatchlist = this.watchlist.filter(w => trade.short === w.short);

			if (!coinsInWatchlist.length) {
				return;
			}

			coinsInWatchlist.forEach((c) => {
				c.price = trade.price;
			});
		},
	},
});

window.app = app;
