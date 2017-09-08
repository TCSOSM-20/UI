properties([
    parameters([
        string(defaultValue: env.BRANCH_NAME, description: '', name: 'GERRIT_BRANCH'),
        string(defaultValue: 'osm/UI', description: '', name: 'GERRIT_PROJECT'),
        string(defaultValue: env.GERRIT_REFSPEC, description: '', name: 'GERRIT_REFSPEC'),
        string(defaultValue: env.GERRIT_PATCHSET_REVISION, description: '', name: 'GERRIT_PATCHSET_REVISION'),
        string(defaultValue: 'https://osm.etsi.org/gerrit', description: '', name: 'PROJECT_URL_PREFIX'),
        booleanParam(defaultValue: true, description: '', name: 'BUILD_SYSTEM'),
    ])
])

def devops_checkout() {
    dir('devops') {
        git url: "${PROJECT_URL_PREFIX}/osm/devops", branch: params.GERRIT_BRANCH
    }
}

node {
    checkout scm
    devops_checkout()

    ci_helper = load "devops/jenkins/ci-pipelines/ci_stage_2.groovy"
    ci_helper.ci_pipeline( 'UI',
                           params.PROJECT_URL_PREFIX,
                           params.GERRIT_PROJECT,
                           params.GERRIT_BRANCH,
                           params.GERRIT_REFSPEC,
                           params.GERRIT_PATCHSET_REVISION,
                           params.BUILD_SYSTEM)
}
