contract organizationContract {

    address owner;
    address creator;
    mapping (bytes32 => uint) approvals;

    modifier onlyOwner { if (msg.sender != owner) throw; _ }

    modifier onlyCreator { if (msg.sender != creator) throw; _ }

    function organizationContract(address eos) {
        owner = eos;
        creator = msg.sender;
    }

    function approve(bytes32 hash) onlyOwner {
        approvals[hash] = now;
    }

    function existsApproval(bytes32 hash) constant returns (bool) {
        if (approvals[hash] > 0) {
            return true;
        }
        return false;
    }

    function validate(bytes32 hash, bytes32 r, bytes32 s, uint8 v) constant returns (bool) {
        return ecrecover(hash, v, r, s) == owner;
    }

    function kill() onlyCreator {
        suicide(msg.sender);
    }
}

contract systemContract {

    struct Organization {
        address account;
        string name;
        string identity;
        address agent;
        uint createTime;
    }

    address public owner;
    Organization[] organizations;

    modifier onlyOwner { if (msg.sender != owner) throw; _ }

    event OrganizationsUpdate(
        address sender,
        address agent
    );

    function systemContract() {
        owner = msg.sender;
    }

    function addOrganization(string name, string identity) {
        for (uint i = 0; i < organizations.length; i++) {
            if (organizations[i].account == msg.sender) {
                throw;
            }
        }

        address agent = new organizationContract(msg.sender);
        organizations.push(Organization({account: msg.sender, name: name, identity: identity, agent: agent,
            createTime: now}));

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

    function getOrganization(uint index) constant returns (address, string, string, address, uint) {
        if (index >= organizations.length) throw;
        return (organizations[index].account, organizations[index].name, organizations[index].identity,
            organizations[index].agent, organizations[index].createTime);
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

    function kill() onlyOwner {
        suicide(msg.sender);
    }
}
