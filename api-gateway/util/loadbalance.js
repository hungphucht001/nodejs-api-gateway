const loadbalancer = {}

loadbalancer.ROUND_ROBIN = (service) => {
    let newIndex = 0;
    if (service.index < service.instances.length) {
        newIndex = service.index
    }
    service.index = newIndex
    service.index++
    return loadbalancer.isEnabled(service, newIndex, loadbalancer.ROUND_ROBIN)
}

loadbalancer.isEnabled = (service, index, loadBalanceStrategy) => {
    console.log(index)
    return service.instances[index].enabled ? index : loadBalanceStrategy(service)
}

loadbalancer.LEAST_USED = (service) => {

}

module.exports = loadbalancer