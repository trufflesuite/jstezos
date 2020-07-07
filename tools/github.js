import request from 'request';
import {join} from 'os/path';

function create_deployment(repo_slug, oauth_token, environment, ref = "master") {
    return request.post({"url": join("https://api.github.com/repos", repo_slug, "deployments"), "headers": {"Accept": "application/vnd.github.ant-man-preview+json", "Authorization": `token ${oauth_token}`}, "json": true, "body": {"ref": ref, "environment": environment, "required_contexts": []}});
}
function create_deployment_status(repo_slug, oauth_token, deployment_id, state, environment, environment_url = null) {
    return request.post({"url": join("https://api.github.com/repos", repo_slug, "deployments", deployment_id.toString(), "statuses"), "headers": {"Accept": "application/vnd.github.flash-preview+json", "Authorization": `token ${oauth_token}`}, "json": true, "body": {"state": state, "environment": environment, "environment_url": environment_url}});
}
export {create_deployment, create_deployment_status};

//# sourceMappingURL=github.js.map
