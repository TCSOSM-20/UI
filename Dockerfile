FROM ubuntu:16.04

RUN apt-get update && apt-get -y install python3 curl build-essential apt-transport-https sudo
RUN curl http://repos.riftio.com/public/xenial-riftware-public-key | apt-key add - && \
	curl -o /etc/apt/sources.list.d/rift.list http://buildtracker.riftio.com/repo_file/ub16/OSM3/ && \
	apt-get update && \
	apt-get -y install \
		rw.tools-container-tools=5.2.0.3.73627 \
		rw.tools-scripts=5.2.0.3.73627

RUN /usr/rift/container_tools/mkcontainer --modes UI-dev --repo OSM3 --rw-version 5.2.0.3.73627

RUN chmod 777 /usr/rift
