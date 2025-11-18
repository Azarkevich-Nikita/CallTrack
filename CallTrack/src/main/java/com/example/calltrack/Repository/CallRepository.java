package com.example.calltrack.Repository;

import com.example.calltrack.Entity.Call;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CallRepository extends JpaRepository<Call, Long> {
}
