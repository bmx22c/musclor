const app = new Vue({
    el: '#app',
    data: {
        exos: [],
        reps: [],
        all: [],
        details: [],
        newExo: {},
        cntExo: 0,
        colorList: [
            'color-1',
            'color-2',
            'color-3'
        ],
		myChart: 0,
    },
    methods: {
        ajax: function(url, params = { } ) {
			let s = url+"?";
			for(let key in params) {
				s += key + "=" + encodeURIComponent(params[key]) +"&"
			}

			return this.$http.get(s);
		},
        initForm: function() {
            this.newExo = { name: "", rep: 0, poids: 0.0 }
        },
        add: function() {
            this.ajax("/exo/save/", this.newExo).then(function() {
                this.exos.push(this.newExo)
                this.initForm()
				this.getAll()
            })
        },
        edit: function() {
            return false;
        },
        remove: function(elem) {
			if(confirm('Voulez-vous vraiment supprimer cette entrée ?')){
				this.ajax("/rep/remove/"+elem._id).then(function() {
					this.getAll()
					this.search(elem.exo)
				})
			}
        },
		getAll: function() {
			this.ajax("/all/list").then(function(res){
				this.all = JSON.parse(res.body)
	
				setTimeout(() => {
					var colorList = [
						'color-1',
						'color-2',
						'color-3'
					]
			
					document.querySelectorAll('.exo').forEach((el) => {
						pickedColor = colorList[Math.floor(Math.random() * colorList.length)]
						el.classList.add(pickedColor)
					})
	
				}, 100);
			})
		},
        search: function(exo) {
			document.querySelector('#titreExo').innerHTML = exo.name
			
            this.ajax("/exo/list/"+exo._id).then(function(res) {
				document.querySelector('#details').classList.remove('hidden')
				this.details = res.body
				listPoidsNbr = []
				listPoids = []
				i = 1
				this.details.forEach((el) => {
					// listPoidsNbr.push(i)
					listPoidsNbr.push(el.rep)
					listPoids.push(el.poids)
					i++
				})
				var ctx = document.getElementById('myChart').getContext('2d');;
				if(this.myChart != 0){
					this.myChart.destroy()
				}
				this.myChart = new Chart(ctx, {
					type: 'bar',
					data: {
						// labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
						labels: listPoidsNbr,
						datasets: [{
							label: 'Poids',
							// data: [12, 19, 3, 5, 2, 3],
							data: listPoids,
							backgroundColor: '#fefefe'
						}]
					},
					options: {
						responsive: false,
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero: true
								}
							}]
						}
					}
				});
            })
        },
		closeDetails: function() {
			document.querySelector('#details').classList.add('hidden')
		}
    },
    mounted: function() {
		this.initForm()

        this.ajax("/exo/list").then(function(res){
            this.exos = res.body
        })

        this.ajax("/rep/list").then(function(res){
            this.reps = res.body
        })
		
		this.getAll()
    },
})