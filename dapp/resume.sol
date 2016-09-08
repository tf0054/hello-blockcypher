contract organizationContract {

    struct Approval {
        address applicantAgent;
        uint from;
        uint to;
        uint acceptTime;
        bool approveResult;
        uint approveTime;
    }

    struct ApproveContact {
        address applicantAgent;
        uint from;
        string identity;
    }

    struct Permission {
        address applicantAgent;
        uint from;
        uint to;
        uint responseTime;
    }

    struct PublishContact {
        address applicantAgent;
        uint from;
        uint to;
        string identity;
    }

    address owner;
    address creator;
    Approval[] approvals;
    ApproveContact[] approveContacts;
    Permission[] permissions;
    PublishContact[] publishContacts;

    event ApproveApply(
        address sender,
        uint from,
        uint to
    );

    event PublishNotify(
        address sender,
        uint from,
        uint to
    );

    modifier onlyOwner { if (msg.sender != owner) throw; _ }

    modifier onlyCreator { if (msg.sender != creator) throw; _ }

    function organizationContract(address eos) {
        owner = eos;
        creator = msg.sender;
    }

    function approveApply(uint from, uint to) {
        approvals.push(Approval({applicantAgent: msg.sender, from: from, to: to, acceptTime: 0, approveResult: false,
            approveTime: 0}));
        ApproveApply(msg.sender, from, to);
    }

    function sizeApprovals() onlyOwner constant returns (uint) {
        return approvals.length;
    }

    function getApproval(uint index) onlyOwner constant returns (address, uint, uint, uint, bool, uint) {
        if (index >= approvals.length) throw;
        uint i = index;
        return (approvals[i].applicantAgent, approvals[i].from, approvals[i].to, approvals[i].acceptTime,
            approvals[i].approveResult, approvals[i].approveTime);
    }

    function approveAccept(address applicantAgent, uint from, string identity) onlyOwner {
        for (uint i = 0; i < approvals.length; i++) {
            if (approvals[i].applicantAgent == applicantAgent && approvals[i].from == from
                && approvals[i].acceptTime == 0) {
                approvals[i].acceptTime = now;

                approveContacts.push(ApproveContact({applicantAgent: applicantAgent, from: from, identity: identity}));
                applicantContract(applicantAgent).approveAccept(from, identity);
                return;
            }
        }
        throw;
    }

    function getApproveContact(address applicantAgent, uint from) onlyOwner constant returns (string) {
        for (uint i = 0; i < approveContacts.length; i++) {
            if (approveContacts[i].applicantAgent == applicantAgent && approveContacts[i].from == from) {
                return approveContacts[i].identity;
            }
        }
        return '';
    }

    function removeApproveContact(address applicantAgent, uint from) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < approveContacts.length; i++) {
             if (approveContacts[i].applicantAgent != applicantAgent || approveContacts[i].from != from) {
                approveContacts[index] = approveContacts[i];
                index++;
            }
        }
        if (index != approveContacts.length) {
            delete approveContacts[approveContacts.length - 1];
            approveContacts.length--;
        }
    }

    function approveResponse(address applicantAgent, uint from, bool result) onlyOwner {
        for (uint i = 0; i < approvals.length; i++) {
            if (approvals[i].applicantAgent == applicantAgent && approvals[i].from == from
                && approvals[i].approveTime == 0) {
                approvals[i].approveResult = result;
                approvals[i].approveTime = now;
                break;
            }
        }
        removeApproveContact(applicantAgent, from);
        applicantContract(applicantAgent).approveResponse(from, result);
    }

    function publishNotify(uint from, uint to) {
        permissions.push(Permission({applicantAgent: msg.sender, from: from, to: to, responseTime: 0}));
        PublishNotify(msg.sender, from, to);
    }

    function sizePermissions() onlyOwner constant returns (uint) {
        return permissions.length;
    }

    function getPermission(uint index) onlyOwner constant returns (address, uint, uint, uint) {
        if (index >= permissions.length) throw;
        uint i = index;
        return (permissions[i].applicantAgent, permissions[i].from, permissions[i].to, permissions[i].responseTime);
    }

    function removePermission(address applicantAgent, uint from, uint to) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < permissions.length; i++) {
             if (permissions[i].applicantAgent != applicantAgent || permissions[i].from != from
                || permissions[i].to != to) {
                permissions[index] = permissions[i];
                index++;
            }
        }
        if (index != permissions.length) {
            delete permissions[permissions.length - 1];
            permissions.length--;
        }
    }

    function publishResponse(address applicantAgent, uint from, uint to, string identity) onlyOwner {
        for (uint i = 0; i < permissions.length; i++) {
            if (permissions[i].applicantAgent == applicantAgent && permissions[i].from == from
                && permissions[i].to == to && permissions[i].responseTime == 0) {
                permissions[i].responseTime = now;

                publishContacts.push(PublishContact({applicantAgent: applicantAgent, from: from, to: to,
                    identity: identity}));
                applicantContract(applicantAgent).publishResponse(owner, from, to, identity);
                return;
            }
        }
        throw;
    }

    function getPublishContact(address applicantAgent, uint from, uint to) onlyOwner constant returns (string) {
        for (uint i = 0; i < publishContacts.length; i++) {
            if (publishContacts[i].applicantAgent == applicantAgent && publishContacts[i].from == from
                && publishContacts[i].from == from) {
                return publishContacts[i].identity;
            }
        }
        return '';
    }

    function removePublishContact(address applicantAgent, uint from, uint to) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < publishContacts.length; i++) {
             if (publishContacts[i].applicantAgent != applicantAgent || publishContacts[i].from != from
                || publishContacts[i].to != to) {
                publishContacts[index] = publishContacts[i];
                index++;
            }
        }
        if (index != publishContacts.length) {
            delete publishContacts[publishContacts.length - 1];
            publishContacts.length--;
        }
    }

    /*
    function sizeResumes(address applicantAgent) onlyOwner constant returns (uint) {
        return applicantContract(applicantAgent).sizeResumes();
    }

    function getResume(address applicantAgent, uint index) onlyOwner constant returns (address, string, uint) {
        var (a, b, c, d, e, f, g) = applicantContract(applicantAgent).getResume(index);
        bytes memory v = applicantContract(applicantAgent).test();
        return (a, b, c);
    }
    */

    function kill() onlyCreator {
        suicide(msg.sender);
    }
}

contract applicantContract {

    struct Resume {
        address orgAgent;
        string name;
        uint from;
        uint to;
        uint createTime;
        uint acceptTime;
        bool approveResult;
        uint approveTime;
    }

    struct ApproveContact {
        address orgAgent;
        uint from;
        string identity;
    }

    struct Permission {
        address orgAgent;
        uint from;
        uint to;
        uint createTime;
        address account;
        uint responseTime;
    }

    struct PublishContact {
        address orgAgent;
        uint from;
        uint to;
        string identity;
    }

    address owner;
    address creator;
    Resume[] resumes;
    ApproveContact[] approveContacts;
    Permission[] permissions;
    PublishContact[] publishContacts;

    modifier onlyOwner { if (msg.sender != owner) throw; _ }

    modifier onlyCreator { if (msg.sender != creator) throw; _ }

    modifier onlyPermission {
        if (msg.sender == owner) {
            _
        } else {
            for (uint i = 0; i < permissions.length; i++) {
                if (permissions[i].account == msg.sender
                    && (permissions[i].from <= now && permissions[i].to >= now)) {
                    _
                    return;
                }
            }
            throw;
        }
    }

    event ApproveAccept(
        address sender,
        uint from,
        string identity
    );

    event ApproveResponse(
        address sender,
        uint from,
        bool result
    );

    event PublishResponse(
        address sender,
        uint from,
        uint to,
        string identity
    );

    function applicantContract(address eos) {
        owner = eos;
        creator = msg.sender;
    }

    function addResume(address orgAgent, string name, uint from, uint to) onlyOwner {
        for (uint i = 0; i < resumes.length; i++) {
            if (resumes[i].orgAgent == orgAgent && resumes[i].from == from) {
                throw;
            }
        }

        resumes.push(Resume({orgAgent: orgAgent, name: name, from: from, to: to, createTime: now, acceptTime: 0,
            approveResult: false, approveTime: 0}));
        organizationContract(orgAgent).approveApply(from, to);
    }

    function sizeResumes() onlyPermission constant returns (uint) {
        return resumes.length;
    }

    function getResume(uint index) onlyPermission constant returns (address, string, uint, uint, uint, uint, bool,
        uint) {
        if (index >= resumes.length) throw;
        uint i = index;
        return (resumes[i].orgAgent, resumes[i].name, resumes[i].from, resumes[i].to, resumes[i].createTime,
            resumes[i].acceptTime, resumes[i].approveResult, resumes[i].approveTime);
    }

    function removeResume(address orgAgent, uint from) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < resumes.length; i++) {
             if (resumes[i].orgAgent != orgAgent || resumes[i].from != from) {
                resumes[index] = resumes[i];
                index++;
            }
        }
        if (index != resumes.length) {
            delete resumes[resumes.length - 1];
            resumes.length--;
        }
    }

    function approveAccept(uint from, string identity) {
        for (uint i = 0; i < resumes.length; i++) {
            if (resumes[i].orgAgent == msg.sender && resumes[i].from == from && resumes[i].acceptTime == 0) {
                resumes[i].acceptTime = now;

                approveContacts.push(ApproveContact({orgAgent: msg.sender, from: from, identity: identity}));
                ApproveAccept(msg.sender, from, identity);
                return;
            }
        }
        throw;
    }

    function getApproveContact(address orgAgent, uint from) onlyOwner constant returns (string) {
        for (uint i = 0; i < approveContacts.length; i++) {
            if (approveContacts[i].orgAgent == orgAgent && approveContacts[i].from == from) {
                return approveContacts[i].identity;
            }
        }
        return '';
    }

    function removeApproveContact(address orgAgent, uint from) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < approveContacts.length; i++) {
             if (approveContacts[i].orgAgent != orgAgent || approveContacts[i].from != from) {
                approveContacts[index] = approveContacts[i];
                index++;
            }
        }
        if (index != approveContacts.length) {
            delete approveContacts[approveContacts.length - 1];
            approveContacts.length--;
        }
    }

    function approveResponse(uint from, bool result) {
        for (uint i = 0; i < resumes.length; i++) {
            if (resumes[i].orgAgent == msg.sender && resumes[i].from == from && resumes[i].approveTime == 0) {
                resumes[i].approveResult = result;
                resumes[i].approveTime = now;

                ApproveResponse(msg.sender, from, result);
                return;
            }
        }
        throw;
    }

    function publish(address orgAgent, uint from, uint to) onlyOwner {
        for (uint i = 0; i < permissions.length; i++) {
            if (permissions[i].orgAgent == orgAgent && permissions[i].from == from && permissions[i].to == to) {
                throw;
            }
        }

        permissions.push(Permission({orgAgent: orgAgent, from: from, to: to, createTime: now, account: address(0),
            responseTime: 0}));
        organizationContract(orgAgent).publishNotify(from, to);
    }

    function sizePermissions() onlyOwner constant returns (uint) {
        return permissions.length;
    }

    function getPermission(uint index) onlyOwner constant returns (address, uint, uint, uint, address, uint) {
        if (index >= permissions.length) throw;
        uint i = index;
        return (permissions[i].orgAgent, permissions[i].from, permissions[i].to, permissions[i].createTime,
            permissions[i].account, permissions[i].responseTime);
    }

    function removePermission(address orgAgent, uint from, uint to) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < permissions.length; i++) {
             if (permissions[i].orgAgent != orgAgent || permissions[i].from != from || permissions[i].to != to) {
                permissions[index] = permissions[i];
                index++;
            }
        }
        if (index != permissions.length) {
            delete permissions[permissions.length - 1];
            permissions.length--;
        }
    }

    function publishResponse(address account, uint from, uint to, string identity) {
        for (uint i = 0; i < permissions.length; i++) {
            if (permissions[i].orgAgent == msg.sender && permissions[i].from == from && permissions[i].to == to
                && permissions[i].responseTime == 0) {
                permissions[i].account = account;
                permissions[i].responseTime = now;

                publishContacts.push(PublishContact({orgAgent: msg.sender, from: from, to: to, identity: identity}));
                PublishResponse(msg.sender, from, to, identity);
                return;
            }
        }
        throw;
    }

    function getPublishContact(address orgAgent, uint from, uint to) onlyOwner constant returns (string) {
        for (uint i = 0; i < publishContacts.length; i++) {
            if (publishContacts[i].orgAgent == orgAgent && publishContacts[i].from == from
                && publishContacts[i].to == to) {
                return publishContacts[i].identity;
            }
        }
        return '';
    }

    function removePublishContact(address orgAgent, uint from, uint to) onlyOwner {
        uint index = 0;
        for (uint i = 0; i < publishContacts.length; i++) {
             if (publishContacts[i].orgAgent != orgAgent || publishContacts[i].from != from
                || publishContacts[i].to != to) {
                publishContacts[index] = publishContacts[i];
                index++;
            }
        }
        if (index != publishContacts.length) {
            delete publishContacts[publishContacts.length - 1];
            publishContacts.length--;
        }
    }

    /*
    function expiredPermissions() onlyOwner {
        uint index = 0;
        for (uint i = 0; i < permissions.length; i++) {
            if (permissions[i].from <= now && permissions[i].to >= now) {
                permissions[index] = permissions[i];
                index++;
            }
        }

        for (i = index; i < permissions.length; i++) {
            delete permissions[i];
        }
        if (index != permissions.length) {
            permissions.length = index;
        }
    }
    */

    function kill() onlyCreator {
        suicide(msg.sender);
    }
}

contract systemContract {

    struct Organization {
        address account;
        string name;
        address agent;
        uint createTime;
    }

    struct Applicant {
        address account;
        address agent;
        uint createTime;
    }

    address public owner;
    Organization[] organizations;
    Applicant[] applicants;

    modifier onlyOwner { if (msg.sender != owner) throw; _ }

    event OrganizationsUpdate(
        address sender,
        address agent
    );

    event ApplicantsUpdate(
        address sender,
        address agent
     );

    function systemContract() {
        owner = msg.sender;
    }

    function addOrganization(string name) {
        for (uint i = 0; i < organizations.length; i++) {
            if (organizations[i].account == msg.sender) {
                throw;
            }
        }

        address agent = new organizationContract(msg.sender);
        organizations.push(Organization({account: msg.sender, name: name, agent: agent, createTime: now}));

        OrganizationsUpdate(msg.sender, agent);
    }

    function getOrganizationAgent() constant returns (address) {
        for (uint i = 0; i < organizations.length; i++) {
            if (organizations[i].account == msg.sender) {
                return organizations[i].agent;
            }
        }
        throw;
    }

    function sizeOrganizations() constant returns (uint) {
        return organizations.length;
    }

    function getOrganization(uint index) constant returns (address, string, address, uint) {
        if (index >= organizations.length) throw;
        return (organizations[index].account, organizations[index].name, organizations[index].agent,
            organizations[index].createTime);
    }

    function removeOrganization(address agent) onlyOwner {
        bool remove = false;
        for (uint i = 0; i < organizations.length; i++) {
            if (organizations[i].agent == agent) {
                remove = true;
                break;
            }
        }

        if (remove) {
            organizationContract(agent).kill();

            uint index = 0;
            for (i = 0; i < organizations.length - 1; i++) {
                 if (organizations[i].agent != agent) {
                    organizations[index] = organizations[i];
                    index++;
                }
            }
            if (index != organizations.length) {
                delete organizations[organizations.length - 1];
                organizations.length--;
            }

            OrganizationsUpdate(msg.sender, agent);
        }
    }

    function addApplicant() {
        for (uint i = 0; i < applicants.length; i++) {
            if (applicants[i].account == msg.sender) {
                throw;
            }
        }

        address agent = new applicantContract(msg.sender);
        applicants.push(Applicant({account: msg.sender, agent: agent, createTime: now}));

        ApplicantsUpdate(msg.sender, agent);
    }

    function getApplicantAgent() constant returns (address) {
        for (uint i = 0; i < applicants.length; i++) {
            if (applicants[i].account == msg.sender) {
                return applicants[i].agent;
            }
        }
        throw;
    }

    function sizeApplicants() onlyOwner constant returns (uint) {
        return applicants.length;
    }

    function getApplicant(uint index) onlyOwner constant returns (address, address, uint) {
        if (index >= applicants.length) throw;
        return (applicants[index].account, applicants[index].agent, applicants[index].createTime);
    }

    function removeApplicant(address agent) onlyOwner {
        bool remove = false;
        for (uint i = 0; i < applicants.length; i++) {
            if (applicants[i].agent == agent) {
                remove = true;
                break;
            }
        }

        if (remove) {
            applicantContract(agent).kill();

            uint index = 0;
            for (i = 0; i < applicants.length - 1; i++) {
                 if (applicants[i].agent != agent) {
                    applicants[index] = applicants[i];
                    index++;
                }
            }
            if (index != applicants.length) {
                delete applicants[applicants.length - 1];
                applicants.length--;
            }

            ApplicantsUpdate(msg.sender, agent);
        }
    }

    function kill() onlyOwner {
        suicide(msg.sender);
    }

    bytes buff;

    function setBytes(bytes b) {
      buff = b;
    }

    function getBytes() constant returns (bytes) {
      return buff;
    }
}