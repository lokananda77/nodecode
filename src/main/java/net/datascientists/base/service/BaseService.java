package net.datascientists.base.service;

import java.util.List;

public interface BaseService<T> {

	public List<T> listAll();
	public List<T> findById(Long id);
	public T create(T o);
	public void update(T o);
	public void delete(T o);
	
}
