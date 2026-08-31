export function routeQuery(state) {
    const { classification } = state;
    if (classification === 'general') {
        return 'generator';
    }
    return 'retriever';
}
