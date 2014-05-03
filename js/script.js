function distance(lnglat1,lnglat2) {

    var rad = Math.PI / 180,
        lat1 = lnglat1[1] * rad,
        lat2 = lnglat2[1] * rad;

    //Earth's radius in miles
    return  3963.19 * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos((lnglat2[0] - lnglat1[0]) * rad));

}