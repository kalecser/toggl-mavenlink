var commons = commons || {};

commons.required = function(value, argumentName) {
    if (value == null) $.error("Argument " + argumentName + " is required");
};

commons.isUndefinedException = function (ex) {
    var isUndefinedEx = ex.message.indexOf("is undefined") > 0 || ex.message.indexOf("is null") > 0 || ex.message.indexOf("is not defined") > 0 || ex.message.indexOf("Cannot read property") >= 0;
    return isUndefinedEx;
};

commons.undefinedToNull = function (fun) {
    try {
        return fun();
    } catch (ex) {
        if (commons.isUndefinedException(ex)) return null;
        throw ex;
    }
};

commons.evalUndefinedToNull = function (code) {
    try {
        return _.undefinedToNull(function() { return eval(code); });
    } catch(ex) {
        throw "Error evaluating " + code + " " + ex.message;
    }
    
};

commons.AMMOUNT_DECIMAL_PRECISION = Math.pow(10, 4);
commons.Ammount = function (ammount) {
    if (typeof ammount == "string") ammount = parseFloat(ammount);
    this.aaToGetANumericReperesentationPleaseCallTheFunction = 'value()';
    this.ammount = Math.floor(ammount * commons.AMMOUNT_DECIMAL_PRECISION);
};
commons.Ammount.prototype.value = function () {
    return this.ammount / commons.AMMOUNT_DECIMAL_PRECISION;
};
commons.Ammount.prototype.add = function (other) {
    if (other.isAmmount) return new commons.Ammount((this.innerValue() + other.innerValue()) / commons.AMMOUNT_DECIMAL_PRECISION);
    return this.add(new commons.Ammount(other));
};
commons.Ammount.prototype.divide = function (other) {
    if (other.isAmmount) return new commons.Ammount(this.innerValue() / other.innerValue());
    return this.divide(new commons.Ammount(other));
};
commons.Ammount.prototype.multiply = function (other) {
    if (other.isAmmount) return new commons.Ammount((this.innerValue() * other.innerValue())/ Math.pow(commons.AMMOUNT_DECIMAL_PRECISION, 2));
    return this.multiply(new commons.Ammount(other));
};
commons.Ammount.prototype.subtract = function (other) {
    if (other.isAmmount) return new commons.Ammount((this.innerValue() - other.innerValue()) / commons.AMMOUNT_DECIMAL_PRECISION);
    return this.subtract(new commons.Ammount(other));
};
commons.Ammount.prototype.innerValue = function() {
    return this.ammount;
};

commons.Ammount.prototype.isAmmount = true;


var oldAlert = alert;
alert = function(message) {
    oldAlert(message);
};

_.mixin({ required: commons.required });
_.mixin({ isUndefinedException: commons.isUndefinedException });
_.mixin({ undefinedToNull: commons.undefinedToNull });
_.mixin({ evalUndefinedToNull: commons.evalUndefinedToNull });


$.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());



Array.prototype.remove = function(value) {
    var index = this.indexOf(value);
    return this.splice(index, 1);
}