import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_mission_lifecycle(async_client: AsyncClient):
    # 1. Create Mission
    mission_payload = {
        "title": "Evacuation Mission Alpha",
        "incident_id": "inc-001",
        "commander_id": "cmd-101",
        "priority": "HIGH",
        "objective_description": "Evacuate trapped citizens from flooded school",
        "success_criteria": ["All citizens evacuated", "No casualties"],
    }
    create_res = await async_client.post("/api/missions/", json=mission_payload)
    assert create_res.status_code == 201
    mission = create_res.json()
    mission_id = mission["id"]
    assert mission["status"] == "DRAFT"

    # 2. Add Task to Mission
    task_payload = {
        "title": "Deploy Rescue Boats",
        "description": "Launch 3 inflatable rescue boats at river bank",
        "priority": "HIGH",
    }
    task_res = await async_client.post(f"/api/missions/{mission_id}/tasks", json=task_payload)
    assert task_res.status_code == 201
    task = task_res.json()
    task_id = task["id"]
    assert task["title"] == "Deploy Rescue Boats"

    # 3. Publish Mission
    pub_res = await async_client.post(f"/api/missions/{mission_id}/publish")
    assert pub_res.status_code == 200
    published = pub_res.json()
    assert published["status"] == "ACTIVE"

    # 4. Start Task
    start_res = await async_client.post(f"/api/missions/{mission_id}/tasks/{task_id}/start")
    assert start_res.status_code == 200
    started_task = start_res.json()
    assert started_task["status"] == "IN_PROGRESS"

    # 5. Complete Task
    comp_task_res = await async_client.post(f"/api/missions/{mission_id}/tasks/{task_id}/complete")
    assert comp_task_res.status_code == 200

    # 6. Complete Mission
    comp_mis_res = await async_client.post(f"/api/missions/{mission_id}/complete")
    assert comp_mis_res.status_code == 200
    completed = comp_mis_res.json()
    assert completed["status"] == "COMPLETED"
