
var request = require('request')
var csv = require('csv')

function Affiliate($app) {
	this.app = $app
	this.token = {}
}

Affiliate.prototype.setAccessToken = function($token) {
	this.token = $token 
}

Affiliate.prototype.requestAccessToken = function(cb) {
	var $this = this
	request({
		method: 'POST',
		url: "https://api.rakutenmarketing.com/token",
		qs: {
			grant_type: 'password',
			username: this.app.username,
			password: this.app.password,
			scope: this.app.sid
		},
		headers: {
			"Authorization" : this.app.TokenRequestAuthorization,
			"Content-Type": "application/x-www-form-urlencoded"
		}
	},function(err,res,body) {
		if (err)
			return cb(err)
		
		try {
			$ret = JSON.parse(body)
		} catch (err) {
			return cb(err)
		}
		
		if (!$ret.hasOwnProperty('refresh_token'))
			return cb($ret)
		
		$this.setAccessToken($ret)

		cb(null,$ret)
	})
	
}

Affiliate.prototype.Report = function($params, cb ) {
	request({
		method: 'GET',
		url: "https://api.rakutenmarketing.com/advancedreports/1.0",
		qs: {
			token: this.app.SecurityToken,
			reportid: 7,
			bdate: $params.bdate,
			edate: $params.edate
		},
		headers: {
			"Authorization" : 'Bearer ' + this.token.access_token,
			"Content-Type": "application/x-www-form-urlencoded"
		}
	},function(err,res,body) {
		if (err)
			return cb(err)
		
		csv.parse( body, function(err, data){
			if (err)
				return cb(err)
			
			if (!data.length)
				return cb({errorMessage: 'empty csv'})
			
			var $indexes = {}
			var $ret = []
			for (var $i in data) {
				if ($i === 0) {
					// skip first row
				} else {
					var $item = {}
					for (var $j in data[$i]) {
						$item[ data[0][$j] ] = data[$i][$j]
					}
					$ret.push($item)
				}
			}
			cb(null,$ret)
		})
	})
}
module.exports =  {
	Affiliate: function($app) {
		return new Affiliate($app)
	}
}

