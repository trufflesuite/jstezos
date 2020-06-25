import * as requests from 'requests';
import {join} from 'os/path';

function applyMixins(derivedCtor, baseCtors) {
baseCtors.forEach(baseCtor => {
Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
});
});
}

function create_deployment(repo_slug, oauth_token, environment, ref = "master") {
    return requests.post({"url": join("https://api.github.com/repos", repo_slug, "deployments"), "headers": {"Accept": "application/vnd.github.ant-man-preview+json", "Authorization": `token ${oauth_token}`}, "json": {"ref": ref, "environment": environment, "required_contexts": []}}).json();
}
function create_deployment_status(repo_slug, oauth_token, deployment_id, state, environment, environment_url = null) {
    if(['success', 'failure'].includes(state)){
        return requests.post({"url": join("https://api.github.com/repos", repo_slug, "deployments", deployment_id.toString(), "statuses"), "headers": {"Accept": "application/vnd.github.flash-preview+json", "Authorization": `token ${oauth_token}`}, "json": {"state": state, "environment": environment, "environment_url": environment_url}}).json();
    }
}

//# sourceMappingURL=github.js.map
